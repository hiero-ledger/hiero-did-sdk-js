import {
  Client,
  SubscriptionHandle,
  Timestamp,
  TopicMessage,
  TopicMessageQuery,
} from '@hashgraph/sdk';

/**
 * Class implementing a message awaiter for Hedera Consensus Service.
 * It waits for messages to be published and available in the topic.
 */
export class MessageAwaiter {
  private client: Client;
  private messages: string[] = [];
  private msTimeout: number;
  private startsAt: Date;
  private waitForTopic: boolean = false;
  private subscriptionHandler: SubscriptionHandle | null;

  public static DEFAULT_TIMEOUT = 2 * 60 * 1000; // 2 minutes

  constructor(
    private readonly topicId: string,
    network: string,
  ) {
    this.client = Client.forName(network);
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
      throw new Error('Timeout must be greater than 0');
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

  withWaitForTopic(): this {
    this.waitForTopic = true;
    return this;
  }

  /**
   * Start waiting for the messages. It will resolve when all messages are found in the topic. If the messages are not found before the timeout, an error is thrown.
   * @returns A promise that resolves when all messages are found in the topic.
   * @throws An error if the messages are not found before the timeout.
   */
  async wait(): Promise<void> {
    if (this.messages.length === 0) {
      throw new Error('No messages to wait for');
    }

    this.clear();

    return new Promise<void>((resolve, reject) => {
      const timeoutHandler = setTimeout(() => {
        this.onFinish();
        reject(
          new Error('Message awaiter timeout reached. Messages not found.'),
        );
      }, this.msTimeout ?? MessageAwaiter.DEFAULT_TIMEOUT);

      this.subscriptionHandler = new TopicMessageQuery()
        .setTopicId(this.topicId)
        .setStartTime(Timestamp.fromDate(this.startsAt ?? new Date()))
        .setMaxAttempts(this.waitForTopic ? 10 : 0)
        .subscribe(
          this.client,
          (_, error) => {
            this.onFinish();
            reject(error);
          },
          (message) => {
            this.handleNewMessage(message);

            if (this.messages.length === 0) {
              this.onFinish();
              clearTimeout(timeoutHandler);
              resolve();
            }
          },
        );
    });
  }

  private clear(): void {
    this.subscriptionHandler = null;
  }

  private handleNewMessage(message: TopicMessage): void {
    const parsedMessage = Buffer.from(message.contents).toString('utf-8');

    const index = this.messages.indexOf(parsedMessage);

    if (index === -1) {
      return;
    }

    this.messages.splice(index, 1);
  }

  private onFinish(): void {
    this.subscriptionHandler?.unsubscribe();
    this.client.close();
  }
}
