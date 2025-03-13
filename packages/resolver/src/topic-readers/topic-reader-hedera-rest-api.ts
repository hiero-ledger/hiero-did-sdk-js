import { Network, DIDError } from '@swiss-digital-assets-institute/core';
import {
  TopicReader,
  TopicReaderMessage,
  TopicReaderOptions,
} from '../interfaces';
import { Timestamp } from '@hashgraph/sdk';

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
  messages: RestAPIMessage[];
  nextPath: string | null;
}

export type TopicReaderHederaRestApiNetworkMap = Record<Network, string>;

/**
 * Implements a topic reader that uses the Hedera Mirror Node REST API to read messages from a topic.
 */
export class TopicReaderHederaRestApi extends TopicReader {
  static readonly DEFAULT_NETWORK_MAP: TopicReaderHederaRestApiNetworkMap = {
    mainnet: 'https://mainnet.mirrornode.hedera.com',
    testnet: 'https://testnet.mirrornode.hedera.com',
    previewnet: 'https://previewnet.mirrornode.hedera.com',
    'local-node': 'http://localhost:5600',
  } as const;

  /**
   * Creates a new Hedera Rest API Topic Reader.
   * @param restApiUrl - The URL of the Hedera Mirror Node REST API
   */
  constructor(private readonly map: TopicReaderHederaRestApiNetworkMap) {
    super();
  }

  async fetchAllToDate(
    topicId: string,
    network: Network,
  ): Promise<TopicReaderMessage[]> {
    return this.fetchFrom(topicId, network, { from: 0, to: Date.now() });
  }

  async fetchFrom(
    topicId: string,
    network: Network,
    options: TopicReaderOptions,
  ): Promise<TopicReaderMessage[]> {
    const messages: TopicReaderMessage[] = [];
    const toTimestamp = Timestamp.fromDate(new Date(options.to));
    const fromTimestamp = Timestamp.fromDate(new Date(options.from));

    let nextPath = `api/v1/topics/${topicId}/messages?timestamp=${encodeURIComponent(
      fromTimestamp.toString(),
    )}`;

    while (nextPath) {
      const url = this.getNextUrl(network, nextPath, 25, 'base64');
      const result = await this.fetchMessages(url);

      for (const message of result.messages) {
        const messageData = Timestamp.fromDate(
          message.consensus_timestamp,
        ).toDate();
        const toDate = toTimestamp.toDate();

        if (messageData.getTime() > toDate.getTime()) {
          return messages;
        }

        messages.push(message.message);
      }

      nextPath = result.nextPath;
    }

    return messages;
  }

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
      return JSON.parse(decodedMessage) as RestAPIMessage;
    });

    return {
      messages: parsedMessages,
      nextPath: links.next,
    };
  }

  private getNextUrl(
    network: Network,
    nextPath: string,
    limit = 25,
    encoding = 'base64',
  ) {
    let apiUrl = this.map[network];

    if (!apiUrl) {
      throw new DIDError(
        'invalidArgument',
        `Trying to fetch messages from unsupported network: ${network}.`,
      );
    }

    if (apiUrl.endsWith('/')) {
      apiUrl = apiUrl.slice(0, -1);
    }

    const url = new URL(`${apiUrl}${nextPath}`);
    url.searchParams.set('limit', limit.toString());
    url.searchParams.set('encoding', encoding);
    return url.toString();
  }

  static forNetwork(
    map: TopicReaderHederaRestApiNetworkMap = this.DEFAULT_NETWORK_MAP,
  ): TopicReaderHederaRestApi {
    return new TopicReaderHederaRestApi(map);
  }
}
