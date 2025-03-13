import {
  Client,
  Timestamp,
  TopicMessage,
  TopicMessageQuery,
} from '@hashgraph/sdk';
import { Network } from '@swiss-digital-assets-institute/core';
import {
  TopicReader,
  TopicReaderMessage,
  TopicReaderOptions,
} from '../interfaces';

/**
 * Implements a topic reader that uses a Hedera Client to read messages from a topic.
 * Hedera Clients is using gRPC to connect to the Hedera network, which may not be available in some environments.
 */
export class TopicReaderHederaClient extends TopicReader {
  /**
   * Fetches all messages from a topic from the start to the end of the topic.
   * @param topicId - The ID of the topic to fetch messages from.
   * @returns A promise that resolves to an array of messages.
   */
  async fetchAllToDate(
    topicId: string,
    network: Network,
  ): Promise<TopicReaderMessage[]> {
    return this.fetchFrom(topicId, network, { from: 0, to: Date.now() });
  }

  /**
   * Fetches messages from a topic from a specific start time to an end time.
   * @param topicId - The ID of the topic to fetch messages from.
   * @param options - The options for the fetch.
   * @returns A promise that resolves to an array of messages.
   */
  async fetchFrom(
    topicId: string,
    network: Network,
    options: TopicReaderOptions,
  ): Promise<TopicReaderMessage[]> {
    const client = Client.forName(network);
    const messages: TopicReaderMessage[] = [];

    return new Promise<TopicReaderMessage[]>((resolve, reject) => {
      const subscriptionHandler = new TopicMessageQuery()
        .setTopicId(topicId)
        .setStartTime(Timestamp.fromDate(new Date(options.from)))
        .setEndTime(Timestamp.fromDate(new Date(options.to)))
        .setMaxAttempts(0)
        .setCompletionHandler(() => {
          // Cleanup
          client.close();
          subscriptionHandler.unsubscribe();

          resolve(messages);
        })
        .subscribe(
          client,
          (_, error) => {
            // Cleanup
            client.close();
            subscriptionHandler.unsubscribe();

            if (
              error instanceof Error &&
              error.message.startsWith('5 NOT_FOUND:')
            ) {
              resolve(messages);
              return;
            }

            reject(error);
          },
          (message) => {
            const parsedMessage = this.parseMessage(message);
            messages.push(parsedMessage);
          },
        );
    });
  }

  /**
   * Parses a raw TopicMessage into a TopicReaderMessage.
   * @param message - The message to parse.
   * @returns A promise that resolves to the parsed message.
   */
  private parseMessage(message: TopicMessage): TopicReaderMessage {
    const parsedMessage = Buffer.from(message.contents).toString('utf-8');
    return parsedMessage;
  }
}
