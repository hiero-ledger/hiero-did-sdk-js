import { TopicReader, TopicReaderMessage, TopicReaderOptions } from '../interfaces';
import { Network } from '@hiero-did-sdk/core';
import { HederaHcsService, HederaHcsServiceConfiguration } from '@hiero-did-sdk/hcs';
import { Buffer } from 'buffer';
import { HEDERA_NETWORKS } from '@hiero-did-sdk/client';

/**
 * Implements a topic reader that uses the HCS Service to read messages from a topic.
 */
export class TopicReaderHederaHcs extends TopicReader {
  private readonly hcsService: HederaHcsService;

  constructor(config: HederaHcsServiceConfiguration) {
    super();

    /* TODO: Remove this guard when the resolver will provide custom networks */
    if (!config.networks.every((net) => typeof net.network === 'string' && HEDERA_NETWORKS.includes(net.network))) {
      throw new Error('Only standard Hedera networks are allowed');
    }

    this.hcsService = new HederaHcsService(config);
  }

  /**
   * Fetches all messages from a topic from the start to the end of the topic.
   * @param topicId - The ID of the topic to fetch messages from.
   * @param network - The network name
   * @returns A promise that resolves to an array of messages.
   */
  async fetchAllToDate(topicId: string, network: Network): Promise<TopicReaderMessage[]> {
    return this.fetchFrom(topicId, network, { from: 0, to: Date.now() });
  }

  /**
   * Fetches messages from a topic from a specific start time to an end time.
   * @param topicId - The ID of the topic to fetch messages from.
   * @param network - The network name
   * @param options - The options for the fetch.
   * @returns A promise that resolves to an array of messages.
   */
  async fetchFrom(topicId: string, network: Network, options: TopicReaderOptions): Promise<TopicReaderMessage[]> {
    const messages = await this.hcsService.getTopicMessages({
      topicId,
      networkName: network,
      toDate: new Date(options.to),
    });
    return messages.map((m) => this.parseMessage(m.contents));
  }

  /**
   * Parses a raw TopicMessage contents into a TopicReaderMessage.
   * @returns A promise that resolves to the parsed message.
   * @param content - The topic message content
   */
  private parseMessage(content: Uint8Array<ArrayBufferLike>): TopicReaderMessage {
    return Buffer.from(content).toString('utf-8');
  }
}
