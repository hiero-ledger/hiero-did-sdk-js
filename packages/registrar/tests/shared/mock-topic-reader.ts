import { TopicReader } from '@hiero-did-sdk/resolver';
import { vi } from 'vitest';

export class MockTopicReader implements TopicReader {
  public fetchFrom = vi.fn();
  public fetchAllToDate = vi.fn();

  withMessages(messages: string[]): this {
    this.fetchFrom.mockResolvedValue(messages);
    return this;
  }

  withMessageSequence(messageSequence: string[][]): this {
    messageSequence.forEach((messages) => {
      this.fetchFrom.mockResolvedValueOnce(messages);
    });
    return this;
  }

  withError(error: Error): this {
    this.fetchFrom.mockRejectedValue(error);
    return this;
  }

  withErrorThenMessages(error: Error, messages: string[]): this {
    this.fetchFrom.mockRejectedValueOnce(error).mockResolvedValue(messages);
    return this;
  }

  reset(): void {
    this.fetchFrom.mockReset();
  }
}
