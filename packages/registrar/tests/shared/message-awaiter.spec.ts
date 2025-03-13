import { MessageAwaiter } from '../../src/shared/message-awaiter';
import { TopicReaderHederaClient } from '@swiss-digital-assets-institute/resolver';
import { MockTopicReader } from './mock-topic-reader';

describe('Message Awaiter', () => {
  it('should create a default topic reader', () => {
    const messageAwaiter = new MessageAwaiter('0.0.123', 'testnet');

    expect(messageAwaiter).toBeDefined();
    expect(messageAwaiter['topicReader']).toBeDefined();
    expect(messageAwaiter['topicReader']).toBeInstanceOf(
      TopicReaderHederaClient,
    );
  });

  it('should set the topic ID for the topic reader', () => {
    const messageAwaiter = new MessageAwaiter('0.0.123', 'testnet');

    expect(messageAwaiter).toBeDefined();
    expect(messageAwaiter['topicId']).toBe('0.0.123');
  });

  it('should set a messages to await', () => {
    const messageAwaiter = new MessageAwaiter('0.0.123', 'testnet');
    const messages = ['message-1', 'message-2'];

    messageAwaiter.forMessages(messages);

    expect(messageAwaiter['messages']).toStrictEqual(messages);
  });

  it('should set a timeout for the message awaiter', () => {
    const messageAwaiter = new MessageAwaiter('0.0.123', 'testnet');
    const timeout = 1000;

    messageAwaiter.withTimeout(timeout);

    expect(messageAwaiter['msTimeout']).toBe(timeout);
  });

  it('should set a start time for the message awaiter', () => {
    const messageAwaiter = new MessageAwaiter('0.0.123', 'testnet');
    const startsAt = new Date();

    messageAwaiter.setStartsAt(startsAt);

    expect(messageAwaiter['startsAt']).toBe(startsAt);
  });

  it('should throw an error if messages to await are not set', async () => {
    const messageAwaiter = new MessageAwaiter('0.0.123', 'testnet');

    const messageAwaiterPromise = messageAwaiter.wait();

    await expect(messageAwaiterPromise).rejects.toThrow(
      'No messages to wait for',
    );
  });

  it('should throw an error when timeout is less then 1', () => {
    expect(() => {
      new MessageAwaiter('0.0.123', 'testnet').withTimeout(0);
    }).toThrow('Timeout must be greater than 0');
  });

  it('should resolve when all messages are found', async () => {
    const mockTopicReader = new MockTopicReader().withMessages([
      'message-1',
      'message-2',
    ]);

    const messageAwaiter = new MessageAwaiter(
      '0.0.123',
      'testnet',
      mockTopicReader,
    );
    const messages = ['message-1', 'message-2'];

    messageAwaiter.forMessages(messages);

    await expect(messageAwaiter.wait()).resolves.not.toThrow();

    expect(mockTopicReader.fetchFrom).toHaveBeenCalledWith(
      '0.0.123',
      'testnet',
      expect.objectContaining({
        from: expect.any(Number),
        to: expect.any(Number),
      }),
    );
  });

  it('should resolve when messages are found in multiple attempts', async () => {
    const mockTopicReader = new MockTopicReader().withMessageSequence([
      ['message-1'],
      ['message-2'],
    ]);

    const messageAwaiter = new MessageAwaiter(
      '0.0.123',
      'testnet',
      mockTopicReader,
    );
    const messages = ['message-1', 'message-2'];

    messageAwaiter.forMessages(messages);
    messageAwaiter.withTimeout(5000);

    await expect(messageAwaiter.wait()).resolves.not.toThrow();

    expect(mockTopicReader.fetchFrom).toHaveBeenCalledTimes(2);
  });

  it('should throw a timeout error when messages are not found within the timeout', async () => {
    const mockTopicReader = new MockTopicReader().withMessages([]);

    const messageAwaiter = new MessageAwaiter(
      '0.0.123',
      'testnet',
      mockTopicReader,
    );
    const messages = ['message-1', 'message-2'];

    messageAwaiter.forMessages(messages);
    messageAwaiter.withTimeout(100);

    await expect(messageAwaiter.wait()).rejects.toThrow(
      'Timeout of 100ms exceeded while waiting for DID update to be visible on the network',
    );
  });

  it('should handle errors from the topic reader', async () => {
    const mockTopicReader = new MockTopicReader().withErrorThenMessages(
      new Error('Network error'),
      ['message-1'],
    );

    const messageAwaiter = new MessageAwaiter(
      '0.0.123',
      'testnet',
      mockTopicReader,
    );
    const messages = ['message-1'];

    messageAwaiter.forMessages(messages);
    messageAwaiter.withTimeout(5000);

    await expect(messageAwaiter.wait()).resolves.not.toThrow();

    expect(mockTopicReader.fetchFrom).toHaveBeenCalledTimes(2);
  });

  it('should use the provided start time when fetching messages', async () => {
    const mockTopicReader = new MockTopicReader().withMessages(['message-1']);

    const messageAwaiter = new MessageAwaiter(
      '0.0.123',
      'testnet',
      mockTopicReader,
    );
    const messages = ['message-1'];
    const startsAt = new Date(2023, 0, 1);

    messageAwaiter.forMessages(messages);
    messageAwaiter.setStartsAt(startsAt);

    await messageAwaiter.wait();

    expect(mockTopicReader.fetchFrom).toHaveBeenCalledWith(
      '0.0.123',
      'testnet',
      expect.objectContaining({
        from: startsAt.getTime(),
      }),
    );
  });

  it('should use increasing intervals as poll count increases', () => {
    const messageAwaiter = new MessageAwaiter('0.0.123', 'testnet');

    for (let i = 0; i < 9; i++) {
      expect(messageAwaiter['calculatePollingInterval'](i)).toEqual(i * 100);
    }

    for (let i = 10; i < 20; i++) {
      expect(messageAwaiter['calculatePollingInterval'](i)).toEqual(1000);
    }
  });
});
