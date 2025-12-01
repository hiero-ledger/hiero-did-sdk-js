import {
  type Client,
  Status,
  type SubscriptionHandle,
  Timestamp,
  TopicId,
  TopicMessageQuery,
  TopicMessageSubmitTransaction,
} from '@hashgraph/sdk';
import { HcsCacheService } from '../cache';
import { CacheConfig } from '../hedera-hcs-service.configuration';
import { Cache, Signer } from '@hiero-did-sdk/core';
import { isMirrorQuerySupported, waitForChangesVisibility } from '../shared';
import { Buffer } from 'buffer';

const DEFAULT_TIMEOUT_SECONDS = 2;

export interface SubmitMessageProps {
  topicId: string;
  message: string;
  submitKeySigner?: Signer;
  waitForChangesVisibility?: boolean;
  waitForChangesVisibilityTimeoutMs?: number;
}

export interface SubmitMessageResult {
  nodeId: string;
  transactionId: string;
  transactionHash: Uint8Array;
}

export interface GetTopicMessagesProps {
  topicId: string;
  maxWaitSeconds?: number;
  toDate?: Date;
  limit?: number;
}

type FetchTopicMessagesProps = GetTopicMessagesProps & {
  fromDate?: Date;
};

export interface TopicMessageData {
  consensusTime: Date;
  contents: Uint8Array;
}

interface ApiTopicMessage {
  consensus_timestamp: string;
  topic_id: string;
  message: string;
  running_hash: string;
  sequence_number: number;
  chunk_info?: {
    initial_transaction_id: string;
    number: number;
    total: number;
  };
}

interface ApiGetTopicMessageResponse {
  messages: ApiTopicMessage[];
  links?: {
    next?: string;
  };
}

export class HcsMessageService {
  private readonly cacheService?: HcsCacheService;

  constructor(
    private readonly client: Client,
    cache?: CacheConfig | Cache | HcsCacheService
  ) {
    if (cache) {
      this.cacheService = cache instanceof HcsCacheService ? cache : new HcsCacheService(cache);
    }
  }

  /**
   * Submit message to HCS Topic
   * @param props - The properties for submitting a message
   * @param props.topicId - The ID of the topic to submit the message to
   * @param props.message - The message content to submit
   * @param props.submitKeySigner - Optional Signer for a key that must sign any message submitted to the topic (access control)
   * @param props.waitForChangesVisibility - Optional flag to wait until the message is visible in the topic
   * @param props.waitForChangesVisibilityTimeoutMs - Optional timeout in milliseconds for waiting for visibility
   * @returns A promise that resolves to the submission result containing nodeId, transactionId, and transactionHash
   */
  public async submitMessage(props: SubmitMessageProps): Promise<SubmitMessageResult> {
    const transaction = new TopicMessageSubmitTransaction()
      .setTopicId(props.topicId)
      .setMessage(props.message)
      .freezeWith(this.client);

    if (props?.submitKeySigner) {
      await props.submitKeySigner.signTransaction(transaction);
    }

    const response = await transaction.execute(this.client);

    const receipt = await response.getReceipt(this.client);
    if (receipt.status !== Status.Success) {
      throw new Error(`Message submit transaction failed: ${receipt.status.toString()}`);
    }

    await this.cacheService?.removeTopicMessages(this.client, props.topicId);

    if (props?.waitForChangesVisibility) {
      const startFrom = new Date(Date.now() - 5000);
      await waitForChangesVisibility({
        fetchFn: () => this.getNewMessagesContent({ topicId: props.topicId, startFrom }),
        checkFn: (messages) => messages.includes(props.message),
        waitTimeout: props?.waitForChangesVisibilityTimeoutMs,
      });
    }

    return {
      nodeId: response.nodeId.toString(),
      transactionId: response.transactionId.toString(),
      transactionHash: response.transactionHash,
    };
  }

  /**
   * Get HCS Topic messages
   * @param props - The properties for retrieving topic messages
   * @param props.topicId - The ID of the topic to get messages from
   * @param props.maxWaitSeconds - Optional maximum wait time in seconds
   * @param props.toDate - Optional end date for message retrieval
   * @param props.limit - Optional maximum number of messages to retrieve
   * @returns A promise that resolves to an array of topic message data
   */
  public async getTopicMessages(props: GetTopicMessagesProps): Promise<TopicMessageData[]> {
    let currentCachedMessages = (await this.cacheService?.getTopicMessages(this.client, props.topicId)) ?? [];

    const lastCachedMessage =
      currentCachedMessages.length > 0 ? currentCachedMessages[currentCachedMessages.length - 1] : undefined;

    const lastCachedMessageDate = lastCachedMessage ? lastCachedMessage.consensusTime : new Date(0);
    const borderlineDate = new Date((props.toDate ? props.toDate : new Date()).getTime() + 1); // +1ms to remove the influence of nanoseconds

    if (lastCachedMessageDate < borderlineDate) {
      const messages = await this.fetchTopicMessages({
        ...props,
        fromDate: lastCachedMessageDate,
        toDate: borderlineDate,
      });
      if (messages.length) {
        currentCachedMessages = this.deduplicateAndSortMessages(...currentCachedMessages, ...messages);
        await this.cacheService?.setTopicMessages(this.client, props.topicId, currentCachedMessages);
      }
    }

    return currentCachedMessages.filter((m) => m.consensusTime <= borderlineDate);
  }

  /**
   * Deduplicate and sort HCS messages
   * @param messages - The array of messages to deduplicate and sort
   * @returns The array of messages that unique and sorted by consensus date
   */
  private deduplicateAndSortMessages(...messages: TopicMessageData[]): TopicMessageData[] {
    const seenTimestamps = new Set();
    return messages
      .filter(({ consensusTime }) => {
        if (seenTimestamps.has(consensusTime.getTime())) {
          return false;
        }
        seenTimestamps.add(consensusTime.getTime());
        return true;
      })
      .sort((a, b) => a.consensusTime.getTime() - b.consensusTime.getTime());
  }

  /**
   * Get messages content from a specific date
   * @param options - The options for retrieving messages
   * @param options.topicId - The ID of the topic to get messages from
   * @param options.startFrom - The date from which to start retrieving messages
   * @returns A promise that resolves to an array of message contents as strings
   * @private
   */
  private async getNewMessagesContent(options: { topicId: string; startFrom: Date }): Promise<string[]> {
    const { topicId, startFrom } = options;
    const messages = await this.fetchTopicMessages({
      topicId,
      fromDate: startFrom,
    });
    return messages.map((message) => Buffer.from(message.contents).toString('utf-8'));
  }

  /**
   * Fetch topic messages using either client or REST approach based on client capabilities
   * @param props - The properties for reading topic messages
   * @param props.topicId - The ID of the topic to read messages from
   * @param props.maxWaitSeconds - Optional maximum wait time in seconds
   * @param props.toDate - Optional end date for message retrieval
   * @param props.limit - Optional maximum number of messages to retrieve
   * @param props.fromDate - Optional start date for message retrieval
   * @returns A promise that resolves to an array of topic message data
   * @private
   */
  private async fetchTopicMessages(props: FetchTopicMessagesProps): Promise<TopicMessageData[]> {
    return isMirrorQuerySupported(this.client)
      ? await this.fetchTopicMessagesWithClient(props)
      : await this.fetchTopicMessagesWithRest(props);
  }

  /**
   * Fetch messages from HCS using Hedera SDK Client (via gRPC)
   * @param props - The properties for reading topic messages
   * @param props.topicId - The ID of the topic to read messages from
   * @param props.maxWaitSeconds - Optional maximum wait time in seconds
   * @param props.fromDate - Optional start date for message retrieval
   * @param props.toDate - Optional end date for message retrieval
   * @param props.limit - Optional maximum number of messages to retrieve
   * @returns A promise that resolves to an array of topic message data
   * @private
   */
  private async fetchTopicMessagesWithClient(props: FetchTopicMessagesProps): Promise<TopicMessageData[]> {
    const { maxWaitSeconds = DEFAULT_TIMEOUT_SECONDS, fromDate, toDate, limit } = props ?? {};
    let subscription: SubscriptionHandle;
    const results: TopicMessageData[] = [];

    return new Promise((resolve, reject) => {
      const query = new TopicMessageQuery()
        .setTopicId(TopicId.fromString(props.topicId))
        .setMaxAttempts(0)
        .setStartTime(fromDate ?? 0);

      if (toDate !== undefined) {
        query.setEndTime(toDate);
      }

      if (limit !== undefined) {
        query.setLimit(limit);
      }

      let timeoutId: NodeJS.Timeout | undefined;

      const restartTimeout = (interval: number) => {
        if (timeoutId) clearTimeout(timeoutId);
        timeoutId = setTimeout(() => {
          clearTimeout(timeoutId);
          subscription.unsubscribe();
          resolve(results);
        }, interval * 500);
      };

      restartTimeout(2 * maxWaitSeconds);

      query.setCompletionHandler(() => {
        clearTimeout(timeoutId);
        subscription.unsubscribe();
        resolve(results);
      });

      subscription = query.subscribe(
        this.client,
        (_message, error) => {
          if (error) {
            if (timeoutId) clearTimeout(timeoutId);
            subscription.unsubscribe();

            if (error instanceof Error && error.message.startsWith('5 NOT_FOUND:')) {
              resolve(results);
              return;
            }

            reject(error);
          }
        },
        (message) => {
          if (message) results.push({ consensusTime: message.consensusTimestamp.toDate(), contents: message.contents });
          restartTimeout(maxWaitSeconds);
        }
      );
    });
  }

  /**
   * Fetch messages from HCS using REST API
   * @param props - The properties for reading topic messages
   * @param props.topicId - The ID of the topic to read messages from
   * @param props.fromDate - Optional start date for message retrieval
   * @param props.toDate - Optional end date for message retrieval
   * @param props.limit - Optional maximum number of messages to retrieve
   * @returns A promise that resolves to an array of topic message data
   * @private
   */
  private async fetchTopicMessagesWithRest(props: FetchTopicMessagesProps): Promise<TopicMessageData[]> {
    const { topicId, fromDate, toDate, limit } = props;

    let messages: TopicMessageData[] = [];

    let nextPath = `/topics/${topicId}/messages?`;
    if (fromDate) {
      const timestamp = Timestamp.fromDate(fromDate);
      nextPath += `&timestamp=gte:${timestamp.toString()}`;
    }
    if (toDate) {
      const timestamp = Timestamp.fromDate(toDate);
      nextPath += `&timestamp=lte:${timestamp.toString()}`;
    }

    while (nextPath && (!limit || messages.length < limit)) {
      const url = this.getNextUrl(nextPath);

      const response = await fetch(url, {
        method: 'GET',
        headers: {
          Accept: 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`Failed to fetch topic messages: ${response.statusText}`);
      }

      const result: ApiGetTopicMessageResponse = await response.json();
      if (result.messages.length) {
        messages = messages.concat(
          result.messages.map((message) => ({
            consensusTime: new Date(Number(message.consensus_timestamp) * 1000),
            contents: Buffer.from(message.message, 'base64'),
          }))
        );
      }
      nextPath = result.links?.next;
    }

    return limit ? messages.slice(0, limit) : messages;
  }

  /**
   * Get next URL for fetching messages using REST API
   * @param nextPath - The path component of the URL
   * @param limit - The maximum number of messages to retrieve (default: 25)
   * @param encoding - The encoding format for the messages (default: 'base64')
   * @returns URL string for the next API request
   * @private
   */
  private getNextUrl(nextPath: string, limit = 25, encoding = 'base64') {
    const restApiUrl = this.client.mirrorRestApiBaseUrl;
    return `${restApiUrl}${nextPath}&limit=${limit.toString()}&encoding=${encoding}`;
  }
}
