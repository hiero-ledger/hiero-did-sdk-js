 
import { Client, PrivateKey, Status, TopicMessageSubmitTransaction, TopicMessageQuery } from '@hashgraph/sdk';
import { Buffer } from 'buffer';
import { HcsCacheService } from '../../src/cache';
import { HcsMessageService, TopicMessageData } from '../../src/hcs';
import { isMirrorQuerySupported } from '../../src/shared';
import { Signer } from '@hiero-did-sdk/signer-internal';

const {
  mockIsMirrorQuerySupported,
  mockWaitForChangesVisibility,
  mockCacheGetTopicInfo,
  mockCacheSetTopicInfo,
  mockCacheRemoveTopicInfo,
  mockCacheRemoveTopicMessages,
  mockCacheGetTopicMessages,
  mockCacheSetTopicMessages,
} = vi.hoisted(() => ({
  mockIsMirrorQuerySupported: vi.fn().mockReturnValue(true),
  mockWaitForChangesVisibility: vi.fn(),
  mockCacheGetTopicInfo: vi.fn().mockResolvedValue(undefined),
  mockCacheSetTopicInfo: vi.fn().mockResolvedValue(undefined),
  mockCacheRemoveTopicInfo: vi.fn().mockResolvedValue(undefined),
  mockCacheRemoveTopicMessages: vi.fn().mockResolvedValue(undefined),
  mockCacheGetTopicMessages: vi.fn().mockResolvedValue(null),
  mockCacheSetTopicMessages: vi.fn().mockResolvedValue(undefined),
}));

vi.mock('../../src/cache', () => ({
  HcsCacheService: vi.fn(function () {
    return {
      getTopicInfo: mockCacheGetTopicInfo,
      setTopicInfo: mockCacheSetTopicInfo,
      removeTopicInfo: mockCacheRemoveTopicInfo,
      removeTopicMessages: mockCacheRemoveTopicMessages,
      getTopicMessages: mockCacheGetTopicMessages,
      setTopicMessages: mockCacheSetTopicMessages,
    };
  }),
}));

vi.mock('../../src/shared', () => ({
  isMirrorQuerySupported: mockIsMirrorQuerySupported,
  waitForChangesVisibility: mockWaitForChangesVisibility,
}));

vi.mock('@hashgraph/sdk', async () => {
  const originalModule = await vi.importActual('@hashgraph/sdk');
  return {
    ...originalModule,
    TopicMessageSubmitTransaction: vi.fn(function () {
      return {
        setTopicId: vi.fn().mockReturnThis(),
        setMessage: vi.fn().mockReturnThis(),
        freezeWith: vi.fn().mockReturnThis(),
        sign: vi.fn().mockResolvedValue(undefined),
        signWith: vi.fn().mockReturnThis(),
        execute: vi.fn(),
      };
    }),
    TopicMessageQuery: vi.fn(),
  };
});

type ErrorCallback = (message: any, error: Error | null) => void;
type MessageCallback = (message: { consensusTimestamp: { toDate: () => Date }; contents: Buffer }) => void;

interface SubscriptionMock {
  unsubscribe: vi.Mock<void, []>;
}

interface TopicMessageQueryMock {
  setTopicId: vi.Mock<TopicMessageQueryMock, [string]>;
  setMaxAttempts: vi.Mock<TopicMessageQueryMock, [number]>;
  setStartTime: vi.Mock<TopicMessageQueryMock, [Date | number]>;
  setEndTime: vi.Mock<TopicMessageQueryMock, [Date | number]>;
  setLimit: vi.Mock<TopicMessageQueryMock, [number]>;
  setCompletionHandler: vi.Mock<TopicMessageQueryMock, [() => void]>;
  subscribe: vi.Mock<SubscriptionMock, [unknown, ErrorCallback, MessageCallback]>;
}

describe('HcsMessageService', () => {
  let client: Client;
  let cache: HcsCacheService;
  let service: HcsMessageService;

  beforeEach(() => {
    vi.clearAllMocks();
    mockIsMirrorQuerySupported.mockReturnValue(true);
    mockWaitForChangesVisibility.mockImplementation(() => Promise.resolve());
    mockCacheGetTopicInfo.mockResolvedValue(undefined);
    mockCacheSetTopicInfo.mockResolvedValue(undefined);
    mockCacheRemoveTopicInfo.mockResolvedValue(undefined);
    mockCacheRemoveTopicMessages.mockResolvedValue(undefined);

    client = {} as vi.Mocked<Client>;
    Object.defineProperty(client, 'mirrorRestApiBaseUrl', { get: vi.fn(), configurable: true });

    cache = new HcsCacheService({ maxSize: 100 });

    service = new HcsMessageService(client, cache);
  });

  type ResponseMockType = {
    getReceipt: vi.Mock<Promise<{ status: Status; toString(): string }>, [Client]>;
    nodeId: { toString(): string };
    transactionId: { toString(): string };
    transactionHash: Uint8Array;
  };

  describe('submitMessage', () => {
    let transactionMock: vi.Mocked<Partial<TopicMessageSubmitTransaction>>;
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
        getReceipt: vi.fn().mockResolvedValue(receiptMock),
        nodeId: { toString: () => 'nodeId' },
        transactionId: { toString: () => 'txId' },
        transactionHash: new Uint8Array([1, 2, 3]),
      };
      transactionMock = {
        setTopicId: vi.fn().mockReturnThis(),
        setMessage: vi.fn().mockReturnThis(),
        freezeWith: vi.fn().mockReturnThis(),
        sign: vi.fn().mockResolvedValue(undefined),
        signWith: vi.fn().mockReturnThis(),
        execute: vi.fn().mockResolvedValue(responseMock),
      };
      (TopicMessageSubmitTransaction as unknown as vi.Mock).mockImplementation(function () {
        return transactionMock;
      });
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
      expect(mockCacheRemoveTopicMessages).toHaveBeenCalledWith(client, '0.0.123');
      expect(mockWaitForChangesVisibility).not.toHaveBeenCalled();

      expect(result).toEqual({
        nodeId: 'nodeId',
        transactionId: 'txId',
        transactionHash: responseMock.transactionHash,
      });
    });

    it('should sign the transaction with submitKey if provided', async () => {
      const submitKey = PrivateKey.generateED25519();
      const submitKeySigner = new Signer(submitKey);

      await service.submitMessage({
        topicId: '0.0.123',
        message: 'msg',
        submitKeySigner,
      });

      const submitPublicKey = await submitKeySigner.publicKeyInstance();
      expect(transactionMock.signWith).toHaveBeenCalledWith(submitPublicKey, expect.any(Function));
    });

    it('should wait for changes visibility if flag is set', async () => {
      await service.submitMessage({
        topicId: '0.0.123',
        message: 'msg',
        waitForChangesVisibility: true,
        waitForChangesVisibilityTimeoutMs: 1000,
      });

      expect(mockWaitForChangesVisibility).toHaveBeenCalled();
       
      const waitArgs = (mockWaitForChangesVisibility as vi.Mock).mock.calls[0][0] as {
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
    it('should return cached messages if toDate is before last cached consensusTime', async () => {
      const cachedMessages = [
        { consensusTime: new Date(2000), contents: Buffer.from('cached1') },
        { consensusTime: new Date(3000), contents: Buffer.from('cached2') },
      ];

      vi.spyOn(cache, 'getTopicMessages').mockResolvedValue(cachedMessages);
      const result = await service.getTopicMessages({
        topicId: '0.0.123',
        toDate: new Date(2500),
      });

      expect(result).toEqual(cachedMessages.filter((m) => m.consensusTime <= new Date(2501)));
    });

    it('should fetch new messages and update cache if needed', async () => {
      const cachedMessages = [{ consensusTime: new Date(1000), contents: Buffer.from('msg1') }];
      vi.spyOn(cache, 'getTopicMessages').mockResolvedValue(cachedMessages);

      const newMessages = [
        { consensusTime: new Date(2000), contents: Buffer.from('msg2') },
        { consensusTime: new Date(3000), contents: Buffer.from('msg3') },
      ];

      vi.spyOn(service as any, 'fetchTopicMessages').mockResolvedValue(newMessages);

      const setTopicMessagesSpy = vi.spyOn(cache, 'setTopicMessages').mockResolvedValue(undefined);

      const result = await service.getTopicMessages({
        topicId: '0.0.123',
        toDate: new Date(4000),
      });

      expect(setTopicMessagesSpy).toHaveBeenCalled();

      expect(result).toEqual(
        [...cachedMessages, ...newMessages].sort((a, b) => a.consensusTime.getTime() - b.consensusTime.getTime())
      );
    });

    it('should call fetchTopicMessages if no cached messages', async () => {
      vi.spyOn(cache, 'getTopicMessages').mockResolvedValue([]);

      vi.spyOn(service as any, 'fetchTopicMessages').mockResolvedValue([]);

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

       
      const result = (service as any).deduplicateAndSortMessages(m1, m2, m3);

      expect(result).toEqual([m1, m2]);
    });
  });

  describe('getNewMessagesContent (private)', () => {
    it('should return message contents as strings', async () => {
      const mockMessages = [{ contents: Buffer.from('hello') }, { contents: Buffer.from('world') }];
      vi.spyOn(service as any, 'fetchTopicMessages').mockResolvedValue(mockMessages);

       
      const contents = await (service as any).getNewMessagesContent({
        topicId: '0.0.123',
        startFrom: new Date(),
      });

      expect(contents).toEqual(['hello', 'world']);
    });
  });

  describe('fetchTopicMessages', () => {
    it('should call fetchTopicMessagesWithClient if supported', async () => {
      (isMirrorQuerySupported as vi.Mock).mockReturnValue(true);

      const result = [{ consensusTime: new Date(), contents: Buffer.from('msg') }];
      vi.spyOn(service as any, 'fetchTopicMessagesWithClient').mockResolvedValue(result);

       
      const res = await (service as any).fetchTopicMessages({ topicId: '0.0.123' });
      expect(res).toEqual(result);
    });

    it('should call fetchTopicMessagesWithRest if not supported', async () => {
      (isMirrorQuerySupported as vi.Mock).mockReturnValue(false);

      const result = [{ consensusTime: new Date(), contents: Buffer.from('msg') }];
      vi.spyOn(service as any, 'fetchTopicMessagesWithRest').mockResolvedValue(result);

       
      const res = await (service as any).fetchTopicMessages({ topicId: '0.0.123' });
      expect(res).toEqual(result);
    });
  });

  describe('fetchTopicMessagesWithClient (private)', () => {
    let subscribeMock: vi.Mock;
    let unsubscribeMock: vi.Mock;
    let queryMock: TopicMessageQueryMock;
    let subscriptionObj: { unsubscribe: vi.Mock };

    beforeEach(() => {
      unsubscribeMock = vi.fn();
      subscriptionObj = { unsubscribe: unsubscribeMock };

      subscribeMock = vi.fn();

      queryMock = {
        setTopicId: vi.fn().mockReturnThis(),
        setMaxAttempts: vi.fn().mockReturnThis(),
        setStartTime: vi.fn().mockReturnThis(),
        setEndTime: vi.fn().mockReturnThis(),
        setLimit: vi.fn().mockReturnThis(),
        setCompletionHandler: vi.fn().mockReturnThis(),
        subscribe: subscribeMock.mockImplementation((_client, errorCb: MessageCallback, messageCb: MessageCallback) => {
          setTimeout(() => {
            messageCb({ consensusTimestamp: { toDate: () => new Date(1) }, contents: Buffer.from('a') });
            messageCb({ consensusTimestamp: { toDate: () => new Date(2) }, contents: Buffer.from('b') });
            queryMock.setCompletionHandler.mock.calls[0][0]();
          }, 10);
          return subscriptionObj;
        }),
      };

      (TopicMessageQuery as vi.Mock).mockImplementation(function() { return queryMock; });
    });

    it('should resolve with collected messages', async () => {
       
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

       
      await expect((service as any).fetchTopicMessagesWithClient({ topicId: '0.0.123' })).rejects.toThrow('some error');
      expect(unsubscribeMock).toHaveBeenCalled();
    });
  });

  describe('fetchTopicMessagesWithRest (private)', () => {
    beforeEach(() => {
      vi.spyOn(client, 'mirrorRestApiBaseUrl', 'get').mockReturnValue('http://mirror-node/');
      global.fetch = vi.fn();
    });

    afterEach(() => {
      vi.resetAllMocks();
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
      (global.fetch as vi.Mock)
        .mockResolvedValueOnce({
          ok: true,
          json: () => Promise.resolve(firstResponse),
        })
        .mockResolvedValueOnce({
          ok: true,
          json: () => Promise.resolve(secondResponse),
        });

       
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
      (global.fetch as vi.Mock).mockResolvedValue({
        ok: true,
        json: () => Promise.resolve(response),
      });

       
      const res: TopicMessageData[] = await (service as any).fetchTopicMessagesWithRest({
        topicId: '0.0.123',
        limit: 2,
      });

      expect(res.length).toBe(2);
    });

    it('should throw on fetch failure', async () => {
      (global.fetch as vi.Mock).mockResolvedValue({
        ok: false,
        statusText: 'Bad Request',
      });

      await expect(
         
        (service as any).fetchTopicMessagesWithRest({ topicId: '0.0.123' })
      ).rejects.toThrow('Failed to fetch topic messages: Bad Request');
    });
  });

  describe('getNextUrl (private)', () => {
    it('should construct URL correctly', () => {
      vi.spyOn(client, 'mirrorRestApiBaseUrl', 'get').mockReturnValue('http://mirror-node');

       
      const nextUrl = (service as any).getNextUrl('/path?param=1', 10, 'base64');
      expect(nextUrl).toBe('http://mirror-node/path?param=1&limit=10&encoding=base64');
    });
  });
});
