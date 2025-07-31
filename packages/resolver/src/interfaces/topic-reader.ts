import { Network } from '@hiero-did-sdk/core';

export interface TopicReaderOptions {
  /**
   * Timestamp in seconds when the query should start.
   * Default is 0.
   */
  from: number;

  /**
   * Timestamp in seconds when the query should end.
   * Default is current time.
   */
  to: number;
}

export type TopicReaderMessage = string;

/**
 * An abstract class that represents a reader for a Hedera Consensus Service topic.
 * It provides a way to fetch messages from a topic and handle them.
 */
export abstract class TopicReader {
  /**
   * Fetches all messages from a topic from the start to the end of the topic.
   * @param topicId - The ID of the topic to fetch messages from.
   * @returns A promise that resolves to an array of messages.
   */
  abstract fetchAllToDate(topicId: string, network: Network): Promise<TopicReaderMessage[]>;

  /**
   * Fetches messages from a topic from a specific start time to an end time.
   * @param topicId - The ID of the topic to fetch messages from.
   * @param options - The options for the fetch.
   * @returns A promise that resolves to an array of messages.
   */
  abstract fetchFrom(topicId: string, network: Network, options: TopicReaderOptions): Promise<TopicReaderMessage[]>;
}
