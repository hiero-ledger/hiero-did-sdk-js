/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-unsafe-argument */
import { TopicReader } from '../src/topic-reader';
import { Client, TopicMessage } from '@hashgraph/sdk';

const responseMock = jest.fn().mockReturnValue(jest.fn());

jest.mock('@hashgraph/sdk', () => {
  const actual: object = jest.requireActual('@hashgraph/sdk');
  const ClientMock = {
    forName: jest.fn().mockReturnThis(),
    close: jest.fn().mockReturnThis(),
    _mirrorNetwork: {
      getNextMirrorNode: jest.fn().mockReturnThis(),
      getChannel: jest.fn().mockReturnThis(),
      makeServerStreamRequest: jest.fn(
        (...args) => responseMock(...args) as never,
      ),
    },
  };

  return {
    ...actual,
    Client: ClientMock,
  };
});

describe('Topic Reader', () => {
  const callCompletionHandler = (): never =>
    responseMock.mock.calls[0][5]() as never;
  const callErrorHandler = (error: Error): never =>
    responseMock.mock.calls[0][4](error) as never;

  it('should create a new SDK Client instance for given network', () => {
    const topicReader = new TopicReader('0.0.123', 'testnet');

    expect(topicReader).toBeDefined();
    expect(topicReader['client']).toBeDefined();

    expect(Client.forName).toHaveBeenCalledTimes(1);
    expect(Client.forName).toHaveBeenCalledWith('testnet');
  });

  it('should close the SDK Client instance when finished', async () => {
    const topicReader = new TopicReader('0.0.123', 'testnet');

    const awaitedPromise = topicReader.fetchAllToDate();
    callCompletionHandler();
    await awaitedPromise;

    expect(Client['close']).toHaveBeenCalledTimes(1);
  });

  it('should unsubscribe when finished', async () => {
    const topicReader = new TopicReader('0.0.123', 'testnet');

    const awaitedPromise = topicReader.fetchAllToDate();

    const subscriptionHandlerSpy = jest.spyOn(
      topicReader['subscriptionHandler'],
      'unsubscribe',
    );

    callCompletionHandler();
    await awaitedPromise;

    expect(subscriptionHandlerSpy).toHaveBeenCalledTimes(1);
  });

  it('should clear instance before new fetch', async () => {
    const topicReader = new TopicReader('0.0.123', 'testnet');
    topicReader['parseMessage']({
      contents: Buffer.from('test'),
    } as never);

    expect(topicReader.getMessages()).toHaveLength(1);

    const awaitedPromise = topicReader.fetchAllToDate();
    callCompletionHandler();

    expect(topicReader.getMessages()).toHaveLength(0);

    await awaitedPromise;
  });

  it('should clear instance data', () => {
    const topicReader = new TopicReader('0.0.123', 'testnet');
    topicReader['messages'] = ['test'];
    topicReader['subscriptionHandler'] = {} as never;

    expect(topicReader.getMessages()).toHaveLength(1);
    expect(topicReader['subscriptionHandler']).toBeDefined();

    topicReader['clear']();

    expect(topicReader.getMessages()).toHaveLength(0);
    expect(topicReader['subscriptionHandler']).toBeNull();
  });

  it('should parse topic message to string and add to messages array', () => {
    const topicReader = new TopicReader('0.0.123', 'testnet');
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    const topicMessage = new TopicMessage({
      contents: Buffer.from('test'),
    });

    topicReader['parseMessage'](topicMessage);

    expect(topicReader.getMessages()).toEqual(['test']);
  });

  it('should close client instance when error occurred', async () => {
    const topicReader = new TopicReader('0.0.123', 'testnet');

    const awaitedPromise = topicReader.fetchAllToDate();
    callErrorHandler(new Error('test error'));

    await expect(awaitedPromise).rejects.toThrow('test error');

    expect(Client['close']).toHaveBeenCalledTimes(1);
  });

  it('should unsubscribe when error occurred', async () => {
    const topicReader = new TopicReader('0.0.123', 'testnet');

    const awaitedPromise = topicReader.fetchAllToDate();

    const subscriptionHandlerSpy = jest.spyOn(
      topicReader['subscriptionHandler'],
      'unsubscribe',
    );

    callErrorHandler(new Error('test error'));
    await expect(awaitedPromise).rejects.toThrow('test error');

    expect(subscriptionHandlerSpy).toHaveBeenCalledTimes(1);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });
});
