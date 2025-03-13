import { DIDError, Network } from '@swiss-digital-assets-institute/core';
import {
  TopicReader,
  TopicReaderHederaClient,
} from '@swiss-digital-assets-institute/resolver';

/**
 * Class implementing a message awaiter for Hedera Consensus Service.
 * It waits for messages to be published and available in the topic.
 */
export class MessageAwaiter {
  private messages: string[] = [];
  private msTimeout: number;
  private startsAt: Date;
  private readonly topicReader: TopicReader;

  public static DEFAULT_TIMEOUT = 2 * 60 * 1000; // 2 minutes

  // Constants for polling interval
  private static BASE_POLLING_INTERVAL = 100; // Base polling interval in ms
  private static MAX_POLLING_INTERVAL = 1000; // Maximum polling interval in ms

  constructor(
    private readonly topicId: string,
    private readonly network: Network,
    topicReader?: TopicReader,
  ) {
    this.topicReader = topicReader ?? new TopicReaderHederaClient();
  }

  /**
   * Set the messages to wait for.
   * @param messages An array of messages to wait for.
   * @returns This instance.
   */
  forMessages(messages: string[]): this {
    this.messages = [...messages];
    return this;
  }

  /**
   * Set the timeout in milliseconds.
   * Timeout is the maximum time to wait for the messages.
   * If the messages are not found in the topic before the timeout, an error is thrown.
   * Default is 2 minutes.
   * @param ms The timeout in milliseconds.
   * @returns This instance.
   */
  withTimeout(ms: number): this {
    if (ms <= 0) {
      throw new DIDError(
        'invalidArgument',
        'Timeout must be greater than 0 ms',
      );
    }

    this.msTimeout = ms;
    return this;
  }

  /**
   * Set the start time to wait for the messages.
   * The messages are expected to be published after this time.
   * @param startsAt The start time as a Date object.
   * @returns This instance.
   */
  setStartsAt(startsAt: Date): this {
    this.startsAt = startsAt;
    return this;
  }

  /**
   * Calculates the polling interval based on the number of polls already performed.
   * The interval increases linearly with each poll (pollCount * 100ms) up to a maximum of 1000ms.
   * @param pollCount Number of polls already performed
   * @returns The polling interval in milliseconds
   */
  private calculatePollingInterval(pollCount: number): number {
    const baseInterval = MessageAwaiter.BASE_POLLING_INTERVAL;
    const maxInterval = MessageAwaiter.MAX_POLLING_INTERVAL;

    const interval = pollCount * baseInterval;

    return Math.min(interval, maxInterval);
  }

  /**
   * Start waiting for the messages. It will resolve when all messages are found in the topic. If the messages are not found before the timeout, an error is thrown.
   * @returns A promise that resolves when all messages are found in the topic.
   * @throws An error if the messages are not found before the timeout.
   */
  async wait(): Promise<void> {
    if (!this.messages || this.messages.length === 0) {
      throw new DIDError(
        'invalidArgument',
        'No messages to wait for. Call forMessages() first.',
      );
    }

    const timeout = this.msTimeout || MessageAwaiter.DEFAULT_TIMEOUT;
    const now = Date.now();
    const endTime = now + timeout;
    const startsAt = this.startsAt || new Date();

    const remainingMessages = new Set(this.messages);
    let pollCount = 0;

    // Keep trying until timeout
    while (Date.now() < endTime) {
      try {
        const messages = await this.topicReader.fetchFrom(
          this.topicId,
          this.network,
          {
            from: startsAt.getTime(),
            to: now,
          },
        );

        for (const message of messages) {
          if (remainingMessages.has(message)) {
            remainingMessages.delete(message);
          }
        }

        if (remainingMessages.size === 0) {
          return;
        }

        const pollingInterval = this.calculatePollingInterval(++pollCount);
        await this.pollWait(pollingInterval);
      } catch {
        // If there's an error fetching messages, wait a bit and try again
        // Use a slightly longer interval for error recovery
        const pollingInterval =
          this.calculatePollingInterval(++pollCount) * 1.5;
        await this.pollWait(pollingInterval);
      }
    }

    // If we get here, the timeout was exceeded
    throw new DIDError(
      'internalError',
      `Timeout of ${timeout}ms exceeded while waiting for DID update to be visible on the network`,
    );
  }

  private async pollWait(pollingInterval: number): Promise<void> {
    await new Promise((resolve) => setTimeout(resolve, pollingInterval));
  }
}
