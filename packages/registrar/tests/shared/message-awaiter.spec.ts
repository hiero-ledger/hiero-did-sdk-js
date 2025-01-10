import { Client, TopicMessage } from '@hashgraph/sdk';
import { com } from '@hashgraph/proto';
import { MessageAwaiter } from '../../src/shared/message-awaiter';

/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-unsafe-argument */
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

jest.useFakeTimers();
jest.spyOn(global, 'setTimeout');
jest.spyOn(global, 'clearTimeout');

describe('Message Awaiter', () => {
  const processMessage = (message: string): never =>
    responseMock.mock.calls[0][3](
      com.hedera.mirror.api.proto.ConsensusTopicResponse.encode({
        message: Uint8Array.from(Buffer.from(message)),
        consensusTimestamp: {
          seconds: 1,
          nanos: 0,
        },
      }).finish(),
    ) as never;

  const callErrorHandler = (error: Error): never =>
    responseMock.mock.calls[0][4](error) as never;

  it('should create a new SDK Client instance for given network', () => {
    const messageAwaiter = new MessageAwaiter('0.0.123', 'testnet');

    expect(messageAwaiter).toBeDefined();
    expect(messageAwaiter['client']).toBeDefined();

    expect(Client.forName).toHaveBeenCalledTimes(1);
    expect(Client.forName).toHaveBeenCalledWith('testnet');
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

  it('should clear a subscription handler', () => {
    const messageAwaiter = new MessageAwaiter('0.0.123', 'testnet');

    messageAwaiter['subscriptionHandler'] = 'some-handler' as never;

    messageAwaiter['clear']();

    expect(messageAwaiter['subscriptionHandler']).toBeNull();
  });

  it('should close the SDK Client instance on finish', () => {
    const messageAwaiter = new MessageAwaiter('0.0.123', 'testnet');

    const unsubscribeMock = jest.fn();
    messageAwaiter['subscriptionHandler'] = {
      unsubscribe: unsubscribeMock,
    } as never;

    messageAwaiter['onFinish']();

    expect(unsubscribeMock).toHaveBeenCalledTimes(1);
    expect(Client['close']).toHaveBeenCalledTimes(1);
  });

  it('should throw an error if messages to await are not set', async () => {
    const messageAwaiter = new MessageAwaiter('0.0.123', 'testnet');

    const messageAwaiterPromise = messageAwaiter.wait();

    await expect(messageAwaiterPromise).rejects.toThrow(
      'No messages to wait for',
    );
  });

  it('should set a default timeout to 2s if not set', async () => {
    const messageAwaiter = new MessageAwaiter('0.0.123', 'testnet').forMessages(
      ['msg'],
    );

    const messageAwaiterPromise = messageAwaiter.wait();
    jest.runAllTimers();

    await expect(messageAwaiterPromise).rejects.toThrow();

    expect(setTimeout).toHaveBeenLastCalledWith(
      expect.any(Function),
      2 * 60 * 1000,
    );
  });

  it('should set a timeout to provided one', async () => {
    const messageAwaiter = new MessageAwaiter('0.0.123', 'testnet')
      .forMessages(['msg'])
      .withTimeout(1000);

    const messageAwaiterPromise = messageAwaiter.wait();
    jest.runAllTimers();

    await expect(messageAwaiterPromise).rejects.toThrow();

    expect(setTimeout).toHaveBeenLastCalledWith(expect.any(Function), 1000);
  });

  it('should have wait for topic set to false as default', () => {
    const messageAwaiter = new MessageAwaiter('0.0.123', 'testnet');

    expect(messageAwaiter['waitForTopic']).toBeFalsy();
  });

  it('should update wait for topic to true', () => {
    const messageAwaiter = new MessageAwaiter(
      '0.0.123',
      'testnet',
    ).withWaitForTopic();

    expect(messageAwaiter['waitForTopic']).toBe(true);
  });

  it('should throw an error when timeout is less then 1', () => {
    expect(() => {
      new MessageAwaiter('0.0.123', 'testnet').withTimeout(0);
    }).toThrow('Timeout must be greater than 0');
  });

  describe('when timeout is reached', () => {
    it('should throw an error', async () => {
      const messageAwaiter = new MessageAwaiter('0.0.123', 'testnet')
        .withTimeout(1000)
        .forMessages(['message-1'])
        .wait();

      jest.runAllTimers();

      await expect(messageAwaiter).rejects.toThrow(
        'Message awaiter timeout reached. Messages not found.',
      );
    });

    it('should call a finish callback', async () => {
      const messageAwaiter = new MessageAwaiter('0.0.123', 'testnet')
        .withTimeout(1000)
        .forMessages(['message-1']);

      const onFinishMock = jest.spyOn(messageAwaiter, 'onFinish' as never);

      const messageAwaiterPromise = messageAwaiter.wait();

      jest.runAllTimers();

      await expect(messageAwaiterPromise).rejects.toThrow();

      expect(onFinishMock).toHaveBeenCalledTimes(1);
    });
  });

  describe('when processing messages', () => {
    let messageAwaiter: MessageAwaiter;

    beforeEach(() => {
      const messages = ['message-1', 'message-2'];
      messageAwaiter = new MessageAwaiter('0.0.123', 'testnet').forMessages(
        messages,
      );
    });

    it('should rethrow an error when listener error occurred', async () => {
      const error = new Error('test error');

      const messageAwaiterPromise = messageAwaiter.wait();
      callErrorHandler(error);

      await expect(messageAwaiterPromise).rejects.toThrow(error);
    });

    it('should call on finish mock when error occurred', async () => {
      const error = new Error('test error');

      const onFinishMock = jest.spyOn(messageAwaiter, 'onFinish' as never);

      const messageAwaiterPromise = messageAwaiter.wait();
      callErrorHandler(error);

      await expect(messageAwaiterPromise).rejects.toThrow();

      expect(onFinishMock).toHaveBeenCalledTimes(1);
    });

    it('should process new messages', async () => {
      jest.spyOn(messageAwaiter, 'handleNewMessage' as never);

      const messageAwaiterPromise = messageAwaiter.withTimeout(1000).wait();
      processMessage('msg');
      jest.runAllTimers();

      await expect(messageAwaiterPromise).rejects.toThrow();
      expect(messageAwaiter['messages']).toHaveLength(2);
      expect(messageAwaiter['handleNewMessage']).toHaveBeenCalledTimes(1);
    });

    it('should resolve after all messages are awaited', async () => {
      jest.spyOn(messageAwaiter, 'handleNewMessage' as never);

      const messageAwaiterPromise = messageAwaiter.wait();
      processMessage('message-1');

      processMessage('some-random');

      processMessage('message-2');

      await expect(messageAwaiterPromise).resolves.toBeUndefined();
      expect(messageAwaiter['messages']).toHaveLength(0);
      expect(messageAwaiter['handleNewMessage']).toHaveBeenCalledTimes(3);
    });

    it('should clear timeout when all messages are awaited', async () => {
      const messageAwaiterPromise = messageAwaiter.wait();
      processMessage('message-1');
      processMessage('message-2');

      await messageAwaiterPromise;

      expect(clearTimeout).toHaveBeenCalledTimes(1);
    });

    it('should call on finish when all messages are awaited', async () => {
      const onFinishMock = jest.spyOn(messageAwaiter, 'onFinish' as never);

      const messageAwaiterPromise = messageAwaiter.wait();
      processMessage('message-1');
      processMessage('message-2');

      await messageAwaiterPromise;

      expect(onFinishMock).toHaveBeenCalledTimes(1);
    });
  });

  describe('handling new messages', () => {
    let messageAwaiter: MessageAwaiter;

    beforeEach(() => {
      const messages = ['message-1', 'message-2'];
      messageAwaiter = new MessageAwaiter('0.0.123', 'testnet').forMessages(
        messages,
      );
    });

    it('should ignore not intended messages', () => {
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore
      const message = new TopicMessage({
        contents: Buffer.from('test'),
      });
      messageAwaiter['handleNewMessage'](message);

      expect(messageAwaiter['messages']).toHaveLength(2);
    });

    it('should remove intended messages from wait list', () => {
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore
      const message = new TopicMessage({
        contents: Buffer.from('message-1'),
      });
      messageAwaiter['handleNewMessage'](message);

      expect(messageAwaiter['messages']).toHaveLength(1);
      expect(messageAwaiter['messages']).not.toContain('message-1');
    });
  });

  afterEach(() => {
    jest.clearAllMocks();
  });
});
