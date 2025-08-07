/* eslint-disable @typescript-eslint/no-explicit-any */
import { Client, PrivateKey, Status, TopicMessageSubmitTransaction, TopicMessageQuery } from '@hashgraph/sdk';
import { Buffer } from 'buffer';
import { HcsCacheService } from '../../src/cache';
import { HcsMessageService, TopicMessageData } from '../../src/hcs';
import { getMirrorNetworkNodeUrl, isMirrorQuerySupported, waitForChangesVisibility } from '../../src/shared';

jest.mock('../../src/cache');
jest.mock('../../src/shared');

jest.mock('@hashgraph/sdk', () => {
  const originalModule = jest.requireActual('@hashgraph/sdk');
  // eslint-disable-next-line @typescript-eslint/no-unsafe-return
  return {
    ...originalModule,
    TopicMessageSubmitTransaction: jest.fn().mockImplementation(() => ({
      setTopicId: jest.fn().mockReturnThis(),
      setMessage: jest.fn().mockReturnThis(),
      freezeWith: jest.fn().mockReturnThis(),
      sign: jest.fn().mockResolvedValue(undefined),
      execute: jest.fn(),
    })),
    TopicMessageQuery: jest.fn(),
  };
});

type ErrorCallback = (message: any, error: Error | null) => void;
type MessageCallback = (message: { consensusTimestamp: { toDate: () => Date }; contents: Buffer }) => void;

interface SubscriptionMock {
  unsubscribe: jest.Mock<void, []>;
}

interface TopicMessageQueryMock {
  setTopicId: jest.Mock<TopicMessageQueryMock, [string]>;
  setMaxAttempts: jest.Mock<TopicMessageQueryMock, [number]>;
  setStartTime: jest.Mock<TopicMessageQueryMock, [Date | number]>;
  setEndTime: jest.Mock<TopicMessageQueryMock, [Date | number]>;
  setLimit: jest.Mock<TopicMessageQueryMock, [number]>;
  setCompletionHandler: jest.Mock<TopicMessageQueryMock, [() => void]>;
  subscribe: jest.Mock<SubscriptionMock, [unknown, ErrorCallback, MessageCallback]>;
}

describe('HcsMessageService', () => {
  let client: Client;
  let cache: HcsCacheService;
  let service: HcsMessageService;

  beforeEach(() => {
    jest.clearAllMocks();
    let client: jest.Mocked<Client>;

    const realCacheServiceMock = new HcsCacheService({ maxSize: 100 });

    jest.spyOn(realCacheServiceMock, 'getTopicInfo').mockResolvedValue(undefined);
    jest.spyOn(realCacheServiceMock, 'setTopicInfo').mockResolvedValue(undefined);
    jest.spyOn(realCacheServiceMock, 'removeTopicInfo').mockResolvedValue(undefined);

    cache = realCacheServiceMock as unknown as jest.Mocked<HcsCacheService>;

    (HcsCacheService as jest.Mock).mockReturnValue(cache);

    (isMirrorQuerySupported as jest.Mock).mockReturnValue(true);

    service = new HcsMessageService(client, cache);
  });

  type ResponseMockType = {
    getReceipt: jest.Mock<Promise<{ status: Status; toString(): string }>, [Client]>;
    nodeId: { toString(): string };
    transactionId: { toString(): string };
    transactionHash: Uint8Array;
  };

  describe('submitMessage', () => {
    let transactionMock: jest.Mocked<Partial<TopicMessageSubmitTransaction>>;
    let responseMock: ResponseMockType;
    let receiptMock: {
      status: Status;
      toString: () => 'Success';
    };

    beforeEach(() => {
      receiptMock = {
        status: Status.Success,
        toString: () => 'Success',
      };
      responseMock = {
        getReceipt: jest.fn().mockResolvedValue(receiptMock),
        nodeId: { toString: () => 'nodeId' },
        transactionId: { toString: () => 'txId' },
        transactionHash: new Uint8Array([1, 2, 3]),
      };
      transactionMock = {
        setTopicId: jest.fn().mockReturnThis(),
        setMessage: jest.fn().mockReturnThis(),
        freezeWith: jest.fn().mockReturnThis(),
        sign: jest.fn().mockResolvedValue(undefined),
        execute: jest.fn().mockResolvedValue(responseMock),
      };
      (TopicMessageSubmitTransaction as unknown as jest.Mock).mockImplementation(() => transactionMock);
      (waitForChangesVisibility as jest.Mock).mockResolvedValue(undefined);
      (cache.removeTopicMessages as jest.Mock).mockResolvedValue(undefined);
    });

    it('should submit message successfully without submitKey and without wait', async () => {
      const result = await service.submitMessage({
        topicId: '0.0.123',
        message: 'hello',
      });

      expect(TopicMessageSubmitTransaction).toHaveBeenCalledTimes(1);
      expect(transactionMock.setTopicId).toHaveBeenCalledWith('0.0.123');
      expect(transactionMock.setMessage).toHaveBeenCalledWith('hello');
      expect(transactionMock.freezeWith).toHaveBeenCalledWith(client);
      expect(transactionMock.sign).not.toHaveBeenCalled();
      expect(transactionMock.execute).toHaveBeenCalledWith(client);
      expect(responseMock.getReceipt).toHaveBeenCalledWith(client);
      expect(cache.removeTopicMessages).toHaveBeenCalledWith(client, '0.0.123');
      expect(waitForChangesVisibility).not.toHaveBeenCalled();

      expect(result).toEqual({
        nodeId: 'nodeId',
        transactionId: 'txId',
        transactionHash: responseMock.transactionHash,
      });
    });

    it('should sign the transaction with submitKey if provided', async () => {
      const submitKey = {} as PrivateKey;

      await service.submitMessage({
        topicId: '0.0.123',
        message: 'msg',
        submitKey,
      });

      expect(transactionMock.sign).toHaveBeenCalledWith(submitKey);
    });

    it('should wait for changes visibility if flag is set', async () => {
      await service.submitMessage({
        topicId: '0.0.123',
        message: 'msg',
        waitForChangesVisibility: true,
        waitForChangesVisibilityTimeoutMs: 1000,
      });

      expect(waitForChangesVisibility).toHaveBeenCalled();
      // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
      const waitArgs = (waitForChangesVisibility as jest.Mock).mock.calls[0][0] as {
        checkFn: (messages: string[]) => boolean;
      };
      expect(waitArgs.checkFn(['msg'])).toBe(true);
    });

    it('should throw error if receipt status not success', async () => {
      receiptMock.status = Status.InvalidTopicId;
      await expect(service.submitMessage({ topicId: '0.0.123', message: 'msg' })).rejects.toThrow(
        'Message submit transaction failed: INVALID_TOPIC_ID'
      );
    });
  });

  describe('getTopicMessages', () => {
    beforeEach(() => {
      (cache.getTopicMessages as jest.Mock).mockResolvedValue(undefined);
      (cache.setTopicMessages as jest.Mock).mockResolvedValue(undefined);
    });

    it('should return cached messages if toDate is before last cached consensusTime', async () => {
      const cachedMessages = [
        { consensusTime: new Date(2000), contents: Buffer.from('cached1') },
        { consensusTime: new Date(3000), contents: Buffer.from('cached2') },
      ];
      (cache.getTopicMessages as jest.Mock).mockResolvedValue(cachedMessages);

      const result = await service.getTopicMessages({
        topicId: '0.0.123',
        toDate: new Date(2500),
      });

      expect(result).toEqual(cachedMessages.filter((m) => m.consensusTime <= new Date(2501)));
    });

    it('should fetch new messages and update cache if needed', async () => {
      const cachedMessages = [{ consensusTime: new Date(1000), contents: Buffer.from('msg1') }];
      (cache.getTopicMessages as jest.Mock).mockResolvedValue(cachedMessages);

      const newMessages = [
        { consensusTime: new Date(2000), contents: Buffer.from('msg2') },
        { consensusTime: new Date(3000), contents: Buffer.from('msg3') },
      ];

      jest.spyOn(service as any, 'fetchTopicMessages').mockResolvedValue(newMessages);

      const result = await service.getTopicMessages({
        topicId: '0.0.123',
        toDate: new Date(4000),
      });

      expect(cache.setTopicMessages).toHaveBeenCalled();

      expect(result).toEqual(
        [...cachedMessages, ...newMessages].sort((a, b) => a.consensusTime.getTime() - b.consensusTime.getTime())
      );
    });

    it('should call fetchTopicMessages if no cached messages', async () => {
      (cache.getTopicMessages as jest.Mock).mockResolvedValue([]);

      jest.spyOn(service as any, 'fetchTopicMessages').mockResolvedValue([]);

      const result = await service.getTopicMessages({
        topicId: '0.0.123',
      });

      expect(result).toEqual([]);
    });
  });

  describe('deduplicateAndSortMessages (private)', () => {
    it('should deduplicate messages by consensusTime and sort them', () => {
      const m1 = { consensusTime: new Date(1000), contents: Buffer.from('1') };
      const m2 = { consensusTime: new Date(2000), contents: Buffer.from('2') };
      const m3 = { consensusTime: new Date(1000), contents: Buffer.from('3') };

      // eslint-disable-next-line @typescript-eslint/no-unsafe-call,@typescript-eslint/no-unsafe-member-access
      const result = (service as any).deduplicateAndSortMessages(m1, m2, m3);

      expect(result).toEqual([m1, m2]);
    });
  });

  describe('getNewMessagesContent (private)', () => {
    it('should return message contents as strings', async () => {
      const mockMessages = [{ contents: Buffer.from('hello') }, { contents: Buffer.from('world') }];
      jest.spyOn(service as any, 'fetchTopicMessages').mockResolvedValue(mockMessages);

      // eslint-disable-next-line @typescript-eslint/no-unsafe-call,@typescript-eslint/no-unsafe-member-access
      const contents = await (service as any).getNewMessagesContent({
        topicId: '0.0.123',
        startFrom: new Date(),
      });

      expect(contents).toEqual(['hello', 'world']);
    });
  });

  describe('fetchTopicMessages', () => {
    it('should call fetchTopicMessagesWithClient if supported', async () => {
      (isMirrorQuerySupported as jest.Mock).mockReturnValue(true);

      const result = [{ consensusTime: new Date(), contents: Buffer.from('msg') }];
      jest.spyOn(service as any, 'fetchTopicMessagesWithClient').mockResolvedValue(result);

      // eslint-disable-next-line @typescript-eslint/no-unsafe-call,@typescript-eslint/no-unsafe-member-access
      const res = await (service as any).fetchTopicMessages({ topicId: '0.0.123' });
      expect(res).toEqual(result);
    });

    it('should call fetchTopicMessagesWithRest if not supported', async () => {
      (isMirrorQuerySupported as jest.Mock).mockReturnValue(false);

      const result = [{ consensusTime: new Date(), contents: Buffer.from('msg') }];
      jest.spyOn(service as any, 'fetchTopicMessagesWithRest').mockResolvedValue(result);

      // eslint-disable-next-line @typescript-eslint/no-unsafe-call,@typescript-eslint/no-unsafe-member-access
      const res = await (service as any).fetchTopicMessages({ topicId: '0.0.123' });
      expect(res).toEqual(result);
    });
  });

  describe('fetchTopicMessagesWithClient (private)', () => {
    let subscribeMock: jest.Mock;
    let unsubscribeMock: jest.Mock;
    let queryMock: TopicMessageQueryMock;
    let subscriptionObj: { unsubscribe: jest.Mock };

    beforeEach(() => {
      unsubscribeMock = jest.fn();
      subscriptionObj = { unsubscribe: unsubscribeMock };

      subscribeMock = jest.fn();

      queryMock = {
        setTopicId: jest.fn().mockReturnThis(),
        setMaxAttempts: jest.fn().mockReturnThis(),
        setStartTime: jest.fn().mockReturnThis(),
        setEndTime: jest.fn().mockReturnThis(),
        setLimit: jest.fn().mockReturnThis(),
        setCompletionHandler: jest.fn().mockReturnThis(),
        subscribe: subscribeMock.mockImplementation((_client, errorCb: MessageCallback, messageCb: MessageCallback) => {
          setTimeout(() => {
            messageCb({ consensusTimestamp: { toDate: () => new Date(1) }, contents: Buffer.from('a') });
            messageCb({ consensusTimestamp: { toDate: () => new Date(2) }, contents: Buffer.from('b') });
            queryMock.setCompletionHandler.mock.calls[0][0]();
          }, 10);
          return subscriptionObj;
        }),
      };

      (TopicMessageQuery as jest.Mock).mockImplementation(() => queryMock);
    });

    it('should resolve with collected messages', async () => {
      // eslint-disable-next-line @typescript-eslint/no-unsafe-call,@typescript-eslint/no-unsafe-member-access
      const res: TopicMessageData[] = await (service as any).fetchTopicMessagesWithClient({
        topicId: '0.0.123',
        limit: 5000,
      });

      expect(TopicMessageQuery).toHaveBeenCalled();
      expect(queryMock.setTopicId).toHaveBeenCalled();
      expect(queryMock.subscribe).toHaveBeenCalled();
      expect(unsubscribeMock).toHaveBeenCalled();
      expect(res.length).toBe(2);
      expect(res[0].contents.toString()).toBe('a');
      expect(res[1].contents.toString()).toBe('b');
    });

    it('should handle error "5 NOT_FOUND:" by resolving empty', async () => {
      subscribeMock.mockImplementation((_client, errorCb: ErrorCallback) => {
        setTimeout(() => {
          errorCb(null, new Error('5 NOT_FOUND: some not found error'));
        }, 0);
        return subscriptionObj;
      });

      // eslint-disable-next-line @typescript-eslint/no-unsafe-call,@typescript-eslint/no-unsafe-member-access
      const res = await (service as any).fetchTopicMessagesWithClient({ topicId: '0.0.123' });
      expect(res).toEqual([]);
      expect(unsubscribeMock).toHaveBeenCalled();
    });

    it('should reject for other errors', async () => {
      subscribeMock.mockImplementation((_client, errorCb: ErrorCallback) => {
        setTimeout(() => {
          errorCb(null, new Error('some error'));
        }, 0);
        return subscriptionObj;
      });

      // eslint-disable-next-line @typescript-eslint/no-unsafe-call,@typescript-eslint/no-unsafe-member-access
      await expect((service as any).fetchTopicMessagesWithClient({ topicId: '0.0.123' })).rejects.toThrow('some error');
      expect(unsubscribeMock).toHaveBeenCalled();
    });
  });

  describe('fetchTopicMessagesWithRest (private)', () => {
    beforeEach(() => {
      (getMirrorNetworkNodeUrl as jest.Mock).mockReturnValue('http://mirror-node');
      global.fetch = jest.fn();
    });

    afterEach(() => {
      jest.resetAllMocks();
    });

    it('should fetch all pages until no next link or limit reached', async () => {
      const firstResponse = {
        messages: [
          { consensus_timestamp: '1000', message: Buffer.from('a').toString('base64') },
          { consensus_timestamp: '2000', message: Buffer.from('b').toString('base64') },
        ],
        links: { next: '/next1' },
      };
      const secondResponse = {
        messages: [{ consensus_timestamp: '3000', message: Buffer.from('c').toString('base64') }],
        links: {},
      };
      (global.fetch as jest.Mock)
        .mockResolvedValueOnce({
          ok: true,
          json: () => Promise.resolve(firstResponse),
        })
        .mockResolvedValueOnce({
          ok: true,
          json: () => Promise.resolve(secondResponse),
        });

      // eslint-disable-next-line @typescript-eslint/no-unsafe-call,@typescript-eslint/no-unsafe-member-access
      const res: TopicMessageData[] = await (service as any).fetchTopicMessagesWithRest({
        topicId: '0.0.123',
        limit: 10,
      });

      expect(global.fetch).toHaveBeenCalledTimes(2);
      expect(res.length).toBe(3);
      expect(res[0].contents.toString()).toBe('a');
      expect(res[2].contents.toString()).toBe('c');
    });

    it('should slice result by limit', async () => {
      const response = {
        messages: [
          { consensus_timestamp: '1000', message: Buffer.from('a').toString('base64') },
          { consensus_timestamp: '2000', message: Buffer.from('b').toString('base64') },
          { consensus_timestamp: '3000', message: Buffer.from('c').toString('base64') },
        ],
      };
      (global.fetch as jest.Mock).mockResolvedValue({
        ok: true,
        json: () => Promise.resolve(response),
      });

      // eslint-disable-next-line @typescript-eslint/no-unsafe-call,@typescript-eslint/no-unsafe-member-access
      const res: TopicMessageData[] = await (service as any).fetchTopicMessagesWithRest({
        topicId: '0.0.123',
        limit: 2,
      });

      expect(res.length).toBe(2);
    });

    it('should throw on fetch failure', async () => {
      (global.fetch as jest.Mock).mockResolvedValue({
        ok: false,
        statusText: 'Bad Request',
      });

      await expect(
        // eslint-disable-next-line @typescript-eslint/no-unsafe-call,@typescript-eslint/no-unsafe-member-access
        (service as any).fetchTopicMessagesWithRest({ topicId: '0.0.123' })
      ).rejects.toThrow('Failed to fetch topic messages: Bad Request');
    });
  });

  describe('getNextUrl (private)', () => {
    it('should construct URL correctly, trimming trailing slash on base URL', () => {
      (getMirrorNetworkNodeUrl as jest.Mock).mockReturnValue('http://mirror-node/');

      // eslint-disable-next-line @typescript-eslint/no-unsafe-call,@typescript-eslint/no-unsafe-member-access
      const nextUrl = (service as any).getNextUrl('/path?param=1', 10, 'base64');
      expect(nextUrl).toBe('http://mirror-node/path?param=1&limit=10&encoding=base64');
    });

    it('should construct URL correctly when no trailing slash', () => {
      (getMirrorNetworkNodeUrl as jest.Mock).mockReturnValue('http://mirror-node');

      // eslint-disable-next-line @typescript-eslint/no-unsafe-call,@typescript-eslint/no-unsafe-member-access
      const nextUrl = (service as any).getNextUrl('/path?param=1');
      expect(nextUrl).toBe('http://mirror-node/path?param=1&limit=25&encoding=base64');
    });
  });
});
