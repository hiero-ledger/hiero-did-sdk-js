import {
  Client,
  SubscriptionHandle,
  Timestamp,
  TopicMessage,
  TopicMessageQuery,
} from '@hashgraph/sdk';

interface Options {
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

/**
 * Reads messages from a Hedera Consensus Service topic.
 */
export class TopicReader {
  private client: Client;
  private messages: string[] = [];
  private subscriptionHandler: SubscriptionHandle | null;

  constructor(
    private readonly topicId: string,
    network: string,
  ) {
    this.client = Client.forName(network);
  }

  getMessages(): string[] {
    return this.messages;
  }

  async fetchAllToDate(): Promise<this> {
    return this.fetchFrom({ from: 0, to: Date.now() });
  }

  async fetchFrom(options: Options): Promise<this> {
    this.clear();
    return new Promise<this>((resolve, reject) => {
      this.subscriptionHandler = new TopicMessageQuery()
        .setTopicId(this.topicId)
        .setStartTime(Timestamp.fromDate(new Date(options.from)))
        .setEndTime(Timestamp.fromDate(new Date(options.to)))
        .setMaxAttempts(0)
        .setCompletionHandler(() => {
          this.onFinish();
          resolve(this);
        })
        .subscribe(
          this.client,
          (_, error) => {
            this.onFinish();
            reject(error);
          },
          (message) => this.parseMessage(message),
        );
    });
  }

  private clear(): void {
    this.messages = [];
    this.subscriptionHandler = null;
  }

  private parseMessage(message: TopicMessage): void {
    const parsedMessage = Buffer.from(message.contents).toString('utf-8');
    this.messages.push(parsedMessage);
  }

  private onFinish(): void {
    this.subscriptionHandler?.unsubscribe();
    this.client.close();
  }
}
