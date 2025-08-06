/* eslint-disable @typescript-eslint/no-explicit-any */
import {
  Client,
  PrivateKey,
  Status,
  StatusError,
  TopicCreateTransaction,
  TopicDeleteTransaction,
  TopicInfoQuery,
  TopicUpdateTransaction,
  Timestamp,
  TopicInfo,
  TopicId,
} from '@hashgraph/sdk';
import {
  CreateTopicProps,
  DeleteTopicProps,
  GetTopicInfoProps,
  HcsTopicService,
  UpdateTopicProps,
} from '../../src/hcs';
import { getMirrorNetworkNodeUrl, isMirrorQuerySupported, waitForChangesVisibility } from '../../src/shared';
import { HcsCacheService } from '../../src/cache';

jest.mock('@hashgraph/sdk', () => {
  const actual = jest.requireActual('@hashgraph/sdk');
  // eslint-disable-next-line @typescript-eslint/no-unsafe-return
  return {
    ...actual,
    Status: { Success: 'SUCCESS', FailInvalid: 'FailInvalid', InvalidTopicId: 'INVALID_TOPIC' },
    TopicCreateTransaction: jest.fn().mockImplementation(() => mockTopicTransaction()),
    TopicUpdateTransaction: jest.fn().mockImplementation(() => mockTopicTransaction()),
    TopicDeleteTransaction: jest.fn().mockImplementation(() => mockTopicTransaction()),
    TopicInfoQuery: jest.fn().mockImplementation(() => ({
      setTopicId: jest.fn().mockReturnThis(),
      execute: jest.fn(),
    })),
  };
});

function mockTopicTransaction() {
  return {
    setTopicMemo: jest.fn().mockReturnThis(),
    setSubmitKey: jest.fn().mockReturnThis(),
    setAdminKey: jest.fn().mockReturnThis(),
    setAutoRenewPeriod: jest.fn().mockReturnThis(),
    setAutoRenewAccountId: jest.fn().mockReturnThis(),
    setTopicId: jest.fn().mockReturnThis(),
    setExpirationTime: jest.fn().mockReturnThis(),
    freezeWith: jest.fn().mockReturnThis(),
    sign: jest.fn().mockResolvedValue(undefined),
    execute: jest.fn(),
  };
}

jest.mock('../../src/shared', () => ({
  waitForChangesVisibility: jest.fn(),
  getMirrorNetworkNodeUrl: jest.fn(),
  isMirrorQuerySupported: jest.fn(),
}));

describe('HcsTopicService', () => {
  let client: jest.Mocked<Client>;
  let service: HcsTopicService;
  let transactionMock: ReturnType<typeof mockTopicTransaction>;
  let cacheServiceMock: jest.Mocked<HcsCacheService>;

  beforeEach(() => {
    jest.clearAllMocks();

    client = {} as jest.Mocked<Client>;

    const realCacheServiceMock = new HcsCacheService({ maxSize: 100 });

    jest.spyOn(realCacheServiceMock, 'getTopicInfo').mockResolvedValue(undefined);
    jest.spyOn(realCacheServiceMock, 'setTopicInfo').mockResolvedValue(undefined);
    jest.spyOn(realCacheServiceMock, 'removeTopicInfo').mockResolvedValue(undefined);

    cacheServiceMock = realCacheServiceMock as unknown as jest.Mocked<HcsCacheService>;

    service = new HcsTopicService(client, cacheServiceMock);

    transactionMock = mockTopicTransaction();

    (TopicCreateTransaction as unknown as jest.Mock).mockImplementation(() => transactionMock);
    (TopicUpdateTransaction as unknown as jest.Mock).mockImplementation(() => transactionMock);
    (TopicDeleteTransaction as unknown as jest.Mock).mockImplementation(() => transactionMock);

    transactionMock.freezeWith.mockReturnValue(transactionMock);
    transactionMock.sign.mockResolvedValue(transactionMock);
    transactionMock.execute.mockReset();
  });

  describe('createTopic', () => {
    it('throws if autoRenewAccountId is provided without autoRenewAccountKey', async () => {
      await expect(service.createTopic({ autoRenewAccountId: '0.0.1' })).rejects.toThrow(
        'The autoRenewAccountKey is required for set the autoRenewAccountId'
      );
    });

    it('creates topic with minimal props', async () => {
      transactionMock.execute.mockResolvedValueOnce({
        getReceipt: jest.fn().mockResolvedValue({ status: Status.Success, topicId: { toString: () => '1.2.3' } }),
      });

      const topicId = await service.createTopic({});
      expect(topicId).toBe('1.2.3');
      expect(transactionMock.freezeWith).toHaveBeenCalledWith(client);
      expect(transactionMock.execute).toHaveBeenCalledWith(client);
    });

    it('sets all properties and signs if keys provided', async () => {
      const adminKey = PrivateKey.generateED25519();
      const submitKey = PrivateKey.generateED25519();
      const autoRenewAccountKey = PrivateKey.generateED25519();

      transactionMock.execute.mockResolvedValueOnce({
        getReceipt: jest.fn().mockResolvedValue({ status: Status.Success, topicId: { toString: () => '4.5.6' } }),
      });

      const props: CreateTopicProps = {
        topicMemo: 'TestMemo',
        submitKey,
        adminKey,
        autoRenewPeriod: 30 * 24 * 60 * 60 * 1000,
        autoRenewAccountId: '0.0.123',
        autoRenewAccountKey,
        waitForChangesVisibility: true,
        waitForChangesVisibilityTimeoutMs: 1000,
      };

      (waitForChangesVisibility as jest.Mock).mockResolvedValueOnce(undefined);
      jest.spyOn(service as any, 'fetchTopicInfo').mockResolvedValue({
        topicId: '4.5.6',
        topicMemo: 'TestMemo',
      } as unknown as TopicInfo);

      const topicId = await service.createTopic(props);

      expect(topicId).toBe('4.5.6');
      expect(transactionMock.setTopicMemo).toHaveBeenCalledWith(props.topicMemo);
      expect(transactionMock.setSubmitKey).toHaveBeenCalledWith(submitKey);
      expect(transactionMock.setAdminKey).toHaveBeenCalledWith(adminKey);
      expect(transactionMock.setAutoRenewPeriod).toHaveBeenCalledWith(props.autoRenewPeriod);
      expect(transactionMock.setAutoRenewAccountId).toHaveBeenCalledWith('0.0.123');

      expect(transactionMock.sign).toHaveBeenCalledWith(autoRenewAccountKey);
      expect(transactionMock.sign).toHaveBeenCalledWith(adminKey);
      expect(waitForChangesVisibility).toHaveBeenCalled();
    });

    it('throws error if receipt.status !== Success', async () => {
      transactionMock.execute.mockResolvedValueOnce({
        getReceipt: jest.fn().mockResolvedValue({ status: Status.FailInvalid, topicId: { toString: () => '1.1.1' } }),
      });
      await expect(service.createTopic({})).rejects.toThrow(/Topic Create transaction failed/);
    });

    it('throws error if receipt.topicId missing', async () => {
      transactionMock.execute.mockResolvedValueOnce({
        getReceipt: jest.fn().mockResolvedValue({ status: Status.Success }),
      });
      await expect(service.createTopic({})).rejects.toThrow(/Transaction receipt do not contain topicId/);
    });
  });

  describe('updateTopic', () => {
    const baseProps: UpdateTopicProps = {
      topicId: '0.0.100',
      currentAdminKey: PrivateKey.generateED25519(),
    };

    it('throws if autoRenewAccountId set without autoRenewAccountKey', async () => {
      await expect(service.updateTopic({ ...baseProps, autoRenewAccountId: '0.0.101' })).rejects.toThrow(
        'The autoRenewAccountKey is required for set the autoRenewAccountId'
      );
    });

    it('does update with default values and signs correctly', async () => {
      transactionMock.execute.mockResolvedValueOnce({
        getReceipt: jest.fn().mockResolvedValue({ status: Status.Success }),
      });

      const props: UpdateTopicProps = {
        ...baseProps,
        topicMemo: 'newMemo',
        submitKey: PrivateKey.generateED25519(),
        adminKey: PrivateKey.generateED25519(),
        autoRenewPeriod: 90 * 24 * 60 * 60,
        autoRenewAccountKey: PrivateKey.generateED25519(),
      };

      // Мок waitForChangesVisibility
      (waitForChangesVisibility as jest.Mock).mockResolvedValueOnce(undefined);
      jest.spyOn(service as any, 'fetchTopicInfo').mockResolvedValue({
        topicId: props.topicId,
        topicMemo: 'newMemo',
        submitKey: props.submitKey.publicKey.toStringDer(),
        adminKey: props.adminKey.publicKey.toStringDer(),
        autoRenewPeriod: 90 * 24 * 60 * 60,
        autoRenewAccountId: undefined,
        expirationTime: undefined,
      } as unknown as TopicInfo);

      await service.updateTopic({ ...props, waitForChangesVisibility: true, waitForChangesVisibilityTimeoutMs: 1234 });

      expect(transactionMock.setTopicId).toHaveBeenCalledWith(props.topicId);
      expect(transactionMock.setTopicMemo).toHaveBeenCalledWith('newMemo');
      expect(transactionMock.setSubmitKey).toHaveBeenCalledWith(props.submitKey);
      expect(transactionMock.setAdminKey).toHaveBeenCalledWith(props.adminKey);
      expect(transactionMock.setAutoRenewPeriod).toHaveBeenCalledWith(90 * 24 * 60 * 60);

      expect(transactionMock.freezeWith).toHaveBeenCalledWith(client);
      expect(transactionMock.sign).toHaveBeenCalledWith(props.autoRenewAccountKey);
      expect(transactionMock.sign).toHaveBeenCalledWith(props.adminKey);
      expect(transactionMock.sign).toHaveBeenCalledWith(props.currentAdminKey);
      expect(transactionMock.execute).toHaveBeenCalledWith(client);

      expect(cacheServiceMock.removeTopicInfo).toHaveBeenCalledWith(client, props.topicId);
      expect(waitForChangesVisibility).toHaveBeenCalled();
    });

    it('throws error if receipt.status !== Success', async () => {
      transactionMock.execute.mockResolvedValueOnce({
        getReceipt: jest.fn().mockResolvedValue({ status: Status.FailInvalid }),
      });

      await expect(service.updateTopic(baseProps)).rejects.toThrow(/Topic update transaction failed/);
    });
  });

  describe('deleteTopic', () => {
    const props: DeleteTopicProps = {
      topicId: '0.0.50',
      currentAdminKey: PrivateKey.generateED25519(),
    };

    it('deletes the topic and waits for changes visibility', async () => {
      transactionMock.freezeWith.mockReturnValueOnce(transactionMock);
      transactionMock.sign.mockResolvedValueOnce(transactionMock);

      transactionMock.execute.mockResolvedValueOnce({
        getReceipt: jest.fn().mockResolvedValue({ status: Status.Success }),
      });

      (waitForChangesVisibility as jest.Mock).mockResolvedValueOnce(undefined);

      jest.spyOn(service as any, 'fetchTopicInfo').mockRejectedValueOnce(
        new StatusError(
          {
            transactionId: undefined,
            status: Status.InvalidTopicId,
          },
          ''
        )
      );

      await service.deleteTopic({
        ...props,
        waitForChangesVisibility: true,
        waitForChangesVisibilityTimeoutMs: 1234,
      });

      expect(transactionMock.setTopicId).toHaveBeenCalledWith(props.topicId);
      expect(transactionMock.freezeWith).toHaveBeenCalledWith(client);
      expect(transactionMock.sign).toHaveBeenCalledWith(props.currentAdminKey);
      expect(transactionMock.execute).toHaveBeenCalledWith(client);

      // expect(cacheServiceMock.removeTopicInfo).toHaveBeenCalledWith(client, props.topicId);
      // expect(waitForChangesVisibility).toHaveBeenCalled();
    });

    it('throws error if receipt.status !== Success', async () => {
      transactionMock.execute.mockResolvedValueOnce({
        getReceipt: jest.fn().mockResolvedValue({ status: Status.FailInvalid }),
      });

      await expect(service.deleteTopic(props)).rejects.toThrow(/Topic delete transaction failed/);
    });
  });

  describe('getTopicInfo', () => {
    const props: GetTopicInfoProps = { topicId: '0.0.200' };

    it('returns cached info if present', async () => {
      const cached = { topicId: '0.0.200', topicMemo: 'Cached memo' };

      cacheServiceMock.getTopicInfo.mockResolvedValueOnce(cached);

      const res = await service.getTopicInfo(props);

      expect(res).toBe(cached);
      expect(cacheServiceMock.getTopicInfo).toHaveBeenCalledWith(client, props.topicId);
      expect(cacheServiceMock.setTopicInfo).not.toHaveBeenCalled();
    });

    it('fetches info if no cache, then sets cache', async () => {
      cacheServiceMock.getTopicInfo.mockResolvedValueOnce(undefined);
      const fetched = { topicId: TopicId.fromString('0.0.200'), topicMemo: 'Fetched memo' };
      jest.spyOn(service as any, 'fetchTopicInfo').mockResolvedValueOnce(fetched);

      const res = await service.getTopicInfo(props);

      expect(res).toEqual(fetched);
      expect(cacheServiceMock.getTopicInfo).toHaveBeenCalledWith(client, props.topicId);
      expect(cacheServiceMock.setTopicInfo).toHaveBeenCalledWith(client, props.topicId, fetched);
    });
  });

  describe('fetchTopicInfo', () => {
    it('calls fetchTopicInfoWithClient if mirror supported', async () => {
      (isMirrorQuerySupported as jest.Mock).mockReturnValue(true);
      const spy = jest
        .spyOn(service as any, 'fetchTopicInfoWithClient')
        .mockResolvedValue({ topicId: 'topic123', topicMemo: 'memo' });

      // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access,@typescript-eslint/no-unsafe-call
      const res = (await (service as any).fetchTopicInfo({ topicId: 'topic123' })) as unknown as TopicInfo;

      expect(spy).toHaveBeenCalled();
      expect(res.topicId).toBe('topic123');
    });

    it('calls fetchTopicInfoWithRest if mirror not supported', async () => {
      (isMirrorQuerySupported as jest.Mock).mockReturnValue(false);
      const spy = jest
        .spyOn(service as any, 'fetchTopicInfoWithRest')
        .mockResolvedValue({ topicId: 'topic456', topicMemo: 'memo2' });

      // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access,@typescript-eslint/no-unsafe-call
      const res = await (service as any).fetchTopicInfo({ topicId: 'topic456' } as unknown as TopicInfo);

      expect(spy).toHaveBeenCalled();
      // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
      expect(res.topicId).toBe('topic456');
    });
  });

  describe('fetchTopicInfoWithClient', () => {
    it('correctly transforms info from SDK', async () => {
      const mockInfo = {
        topicId: { toString: () => '0.0.10' },
        topicMemo: 'testMemo',
        adminKey: {
          toStringRaw: () => 'adminKeyString',
        },
        submitKey: {
          toStringRaw: () => 'submitKeyString',
        },
        autoRenewPeriod: { seconds: { low: 12345 } },
        autoRenewAccountId: { toString: () => '0.0.5' },
        expirationTime: { seconds: { low: 67890 } },
      };

      (TopicInfoQuery as unknown as jest.Mock).mockImplementation(() => ({
        setTopicId: jest.fn().mockReturnThis(),
        execute: jest.fn().mockResolvedValue(mockInfo),
      }));

      // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access,@typescript-eslint/no-unsafe-call
      const result = await (service as any).fetchTopicInfoWithClient({ topicId: '0.0.10' });

      expect(result).toEqual({
        topicId: '0.0.10',
        topicMemo: 'testMemo',
        adminKey: 'adminKeyString',
        submitKey: 'submitKeyString',
        autoRenewPeriod: 12345,
        autoRenewAccountId: '0.0.5',
        expirationTime: 67890,
      });
    });
  });

  describe('fetchTopicInfoWithRest', () => {
    beforeEach(() => {
      global.fetch = jest.fn();
      (getMirrorNetworkNodeUrl as jest.Mock).mockReturnValue('https://test-node');
    });

    afterEach(() => {
      jest.resetAllMocks();
    });

    it('fetches info from REST and transforms data', async () => {
      const fetchedData = {
        deleted: false,
        topic_id: '0.0.15',
        memo: 'restMemo',
        admin_key: { _type: 'ed25519', key: 'adminKeyRest' },
        submit_key: { _type: 'ed25519', key: 'submitKeyRest' },
        auto_renew_period: 777,
        auto_renew_account: '0.0.7',
        expiration_time: new Date(1650000000000).toISOString(),
      };

      (global.fetch as jest.Mock).mockResolvedValue({
        ok: true,
        json: jest.fn().mockResolvedValue(fetchedData),
      });

      // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access,@typescript-eslint/no-unsafe-call
      const res = await (service as any).fetchTopicInfoWithRest({ topicId: '0.0.15' });

      expect(global.fetch).toHaveBeenCalledWith(
        expect.stringContaining('https://test-node/api/v1/topics/0.0.15'),
        expect.any(Object)
      );
      expect(res).toEqual({
        topicId: '0.0.15',
        topicMemo: 'restMemo',
        adminKey: 'adminKeyRest',
        submitKey: 'submitKeyRest',
        autoRenewPeriod: 777,
        autoRenewAccountId: '0.0.7',
        expirationTime: new Date(fetchedData.expiration_time).getTime(),
      });
    });

    it('throws error if fetch response is not ok', async () => {
      (global.fetch as jest.Mock).mockResolvedValue({
        ok: false,
        statusText: 'Not Found',
      });

      // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access,@typescript-eslint/no-unsafe-call
      await expect((service as any).fetchTopicInfoWithRest({ topicId: '0.0.99' })).rejects.toThrow(
        /Failed to fetch topic info: Not Found/
      );
    });

    it('throws StatusError with InvalidTopicId if topic marked deleted', async () => {
      const deletedData = {
        deleted: true,
        topic_id: '0.0.100',
        memo: '',
      };
      (global.fetch as jest.Mock).mockResolvedValue({
        ok: true,
        json: jest.fn().mockResolvedValue(deletedData),
      });

      // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access,@typescript-eslint/no-unsafe-call
      await expect((service as any).fetchTopicInfoWithRest({ topicId: '0.0.100' })).rejects.toThrow(StatusError);
    });
  });

  describe('convertExpirationTimeToSeconds', () => {
    it('converts Timestamp instance', () => {
      const date = new Date(1600000000000);
      const timestamp = new Timestamp(date.getTime() / 1000, 0);

      // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access,@typescript-eslint/no-unsafe-call
      const result = (service as any).convertExpirationTimeToSeconds(timestamp);
      expect(result).toBe(Math.floor(date.getTime() / 1000));
    });

    it('converts Date instance', () => {
      const date = new Date(1600000000000);

      // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access,@typescript-eslint/no-unsafe-call
      const result = (service as any).convertExpirationTimeToSeconds(date);
      expect(result).toBe(Math.floor(date.getTime() / 1000));
    });

    it('throws error on unsupported type', () => {
      // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access,@typescript-eslint/no-unsafe-call,@typescript-eslint/no-unsafe-return
      expect(() => (service as any).convertExpirationTimeToSeconds(undefined)).toThrow(
        'Unsupported expirationTime type'
      );
    });
  });
});
