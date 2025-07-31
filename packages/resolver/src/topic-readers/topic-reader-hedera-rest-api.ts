import { Network, DIDError } from '@hiero-did-sdk/core';
import { TopicReader, TopicReaderMessage, TopicReaderOptions } from '../interfaces';
import { Timestamp } from '@hashgraph/sdk';
import { Buffer } from 'buffer';

interface RestAPIMessage {
  consensus_timestamp: string;
  message: string;
}

interface RestAPIMessageResponse {
  messages: RestAPIMessage[];
  links: {
    next: string | null;
  };
}

interface FetchResult {
  messages: string[];
  nextPath: string | null;
}

export type TopicReaderHederaRestApiNetworkMap = Record<Network, string>;

/**
 * Implements a topic reader that uses the Hedera Mirror Node REST API to read messages from a topic.
 */
export class TopicReaderHederaRestApi extends TopicReader {
  /**
   * The default network map to use for the Hedera Rest API.
   * It contains the public Hedera Mirror Node REST API for mainnet, testnet, previewnet and local-node.
   */
  static readonly DEFAULT_NETWORK_MAP: TopicReaderHederaRestApiNetworkMap = {
    mainnet: 'https://mainnet.mirrornode.hedera.com',
    testnet: 'https://testnet.mirrornode.hedera.com',
    previewnet: 'https://previewnet.mirrornode.hedera.com',
    'local-node': 'http://localhost:5600',
  } as const;

  /**
   * Constructor for the Rest API Topic Reader.
   * @param map - The network map to use for the Hedera Rest API. If not provided, the default network map will be used.
   */
  constructor(private readonly map: TopicReaderHederaRestApiNetworkMap = TopicReaderHederaRestApi.DEFAULT_NETWORK_MAP) {
    super();
  }

  /**
   * Fetches all messages from a topic from the start to the end of the topic.
   * @param topicId - The ID of the topic to fetch messages from.
   * @param network - The network to use for the Hedera Rest API.
   * @returns A promise that resolves to an array of messages.
   */
  async fetchAllToDate(topicId: string, network: Network): Promise<TopicReaderMessage[]> {
    return this.fetchFrom(topicId, network, { from: 0, to: Date.now() });
  }

  /**
   * Fetches messages from a topic from a specific start time to an end time.
   * @param topicId - The ID of the topic to fetch messages from.
   * @param network - The network to use for the Hedera Rest API.
   * @param options - The options for the fetch.
   * @returns A promise that resolves to an array of messages.
   */
  async fetchFrom(topicId: string, network: Network, options: TopicReaderOptions): Promise<TopicReaderMessage[]> {
    let topicReaderMessages: string[] = [];
    const toTimestamp = Timestamp.fromDate(new Date(options.to));
    const fromTimestamp = Timestamp.fromDate(new Date(options.from));

    let nextPath = `/api/v1/topics/${topicId}/messages?timestamp=gte:${fromTimestamp.toString()}&timestamp=lte:${toTimestamp.toString()}`;

    while (nextPath) {
      const url = this.getNextUrl(network, nextPath);
      const result = await this.fetchMessages(url);

      topicReaderMessages = topicReaderMessages.concat(result.messages);
      nextPath = result.nextPath!;
    }
    return topicReaderMessages;
  }

  /**
   * Fetches messages from a topic using provided URL.
   * @param url - The URL to fetch messages from.
   * @returns A promise that resolves result of the fetch with messages and next path.
   */
  private async fetchMessages(url: string): Promise<FetchResult> {
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        Accept: 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch topic messages: ${response.statusText}`);
    }

    const data: RestAPIMessageResponse = await response.json();
    const messages = data.messages;
    const links = data.links;

    const parsedMessages = messages.map(({ message }) => {
      const decodedMessage = Buffer.from(message, 'base64').toString('utf-8');
      return decodedMessage;
    });

    return {
      messages: parsedMessages,
      nextPath: links.next,
    };
  }

  /**
   * Constructs the next URL for the fetch.
   * @param network - The network to use for the Hedera Rest API.
   * @param nextPath - The path to fetch messages from.
   * @param limit - The limit of messages to fetch.
   * @param encoding - The encoding of the messages.
   * @returns The next URL for the fetch.
   */
  private getNextUrl(network: Network, nextPath: string, limit = 25, encoding = 'base64') {
    let apiUrl = this.map[network];

    if (!apiUrl) {
      throw new DIDError('invalidArgument', `Trying to fetch messages from unsupported network: ${network}.`);
    }

    if (apiUrl.endsWith('/')) {
      apiUrl = apiUrl.slice(0, -1);
    }

    const url = new URL(`${apiUrl}${nextPath}`);
    url.searchParams.set('limit', limit.toString());
    url.searchParams.set('encoding', encoding);

    return url.toString();
  }
}
