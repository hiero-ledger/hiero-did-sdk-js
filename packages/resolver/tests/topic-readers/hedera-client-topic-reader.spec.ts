/* eslint-disable @typescript-eslint/no-unsafe-argument */
import { TopicReaderHederaClient } from '../../src/topic-readers';
import { Client, TopicMessage, Timestamp } from '@hashgraph/sdk';
import { Buffer } from 'buffer';
import { vi } from 'vitest';
const subscribeMock = vi.fn();
const completionHandlerMock = vi.fn();
const errorHandlerMock = vi.fn();
const messageHandlerMock = vi.fn();
const unsubscribeMock = vi.fn();

vi.mock('@hashgraph/sdk', () => {
  const actual: object = vi.importActual('@hashgraph/sdk');

  const TopicMessageQueryMock = vi.fn().mockImplementation(() => ({
    setTopicId: vi.fn().mockReturnThis(),
    setStartTime: vi.fn().mockReturnThis(),
    setEndTime: vi.fn().mockReturnThis(),
    setMaxAttempts: vi.fn().mockReturnThis(),
    setCompletionHandler: vi.fn().mockImplementation((handler) => {
      completionHandlerMock.mockImplementation(handler);
      return {
        subscribe: subscribeMock.mockImplementation(
          (_, errorHandler, messageHandler) => {
            errorHandlerMock.mockImplementation(errorHandler);
            messageHandlerMock.mockImplementation(messageHandler);
            return {
              unsubscribe: unsubscribeMock,
            };
          },
        ),
      };
    }),
  }));

  const ClientMock = {
    forName: vi.fn().mockReturnThis(),
    close: vi.fn().mockReturnThis(),
  };

  return {
    ...actual,
    Client: ClientMock,
    TopicMessageQuery: TopicMessageQueryMock,
    Timestamp: {
      fromDate: vi.fn().mockReturnValue('mocked-timestamp'),
    },
  };
});

describe('Topic Reader Hedera Client', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should create a new SDK Client instance', () => {
    const topicReader = new TopicReaderHederaClient();
    expect(topicReader).toBeDefined();
  });

  it('should create a new SDK Client instance for given network', async () => {
    const topicReader = new TopicReaderHederaClient();

    const promise = topicReader.fetchAllToDate('0.0.123', 'testnet');
    completionHandlerMock();
    await promise;

    expect(Client.forName).toHaveBeenCalledTimes(1);
    expect(Client.forName).toHaveBeenCalledWith('testnet');
  });

  it('should parse topic message to string and add to messages array', () => {
    const topicReader = new TopicReaderHederaClient();
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    const topicMessage = new TopicMessage({
      contents: Buffer.from('test'),
    });

    expect(topicReader['parseMessage'](topicMessage)).toEqual('test');
  });

  it('should result with no messages when topic not found', async () => {
    const topicReader = new TopicReaderHederaClient();

    const promise = topicReader.fetchAllToDate('0.0.123', 'testnet');
    errorHandlerMock(null, new Error('5 NOT_FOUND: 0.0.123 does not exist'));

    expect(await promise).toEqual([]);

    expect(unsubscribeMock).toHaveBeenCalled();
  });

  it('should call fetch from with correct parameters', async () => {
    const topicReader = new TopicReaderHederaClient();

    const fetchFromSpy = vi.spyOn(topicReader, 'fetchFrom');

    const promise = topicReader.fetchAllToDate('0.0.123', 'testnet');
    completionHandlerMock();
    await promise;

    expect(fetchFromSpy).toHaveBeenCalledWith('0.0.123', 'testnet', {
      from: 0,
      to: expect.any(Number),
    });
  });

  it('should fetch messages from a topic with specific time range', async () => {
    const topicReader = new TopicReaderHederaClient();
    const startTime = 1609459200000; // 2021-01-01
    const endTime = 1612137600000; // 2021-02-01

    const promise = topicReader.fetchFrom('0.0.123', 'testnet', {
      from: startTime,
      to: endTime,
    });

    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    const topicMessage = new TopicMessage({
      contents: Buffer.from('test message'),
    });
    messageHandlerMock(topicMessage);

    completionHandlerMock();
    const result = await promise;

    expect(result).toHaveLength(1);
    expect(result[0]).toEqual('test message');
    expect(Timestamp.fromDate).toHaveBeenCalledTimes(2);
    expect(Timestamp.fromDate).toHaveBeenNthCalledWith(1, new Date(startTime));
    expect(Timestamp.fromDate).toHaveBeenNthCalledWith(2, new Date(endTime));
    expect(unsubscribeMock).toHaveBeenCalled();
  });

  it('should handle errors during fetchFrom', async () => {
    const topicReader = new TopicReaderHederaClient();
    const startTime = 1609459200000;
    const endTime = 1612137600000;

    const promise = topicReader.fetchFrom('0.0.123', 'testnet', {
      from: startTime,
      to: endTime,
    });

    const testError = new Error('Test error');
    errorHandlerMock(null, testError);

    await expect(promise).rejects.toEqual(testError);

    expect(unsubscribeMock).toHaveBeenCalled();
  });
});
