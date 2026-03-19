import {
  Client,
  PrivateKey,
  PublicKey,
  Status,
  StatusError,
  TopicInfoQuery,
  Timestamp,
  TopicInfo,
  TopicId,
} from '@hiero-ledger/sdk';
import {
  CreateTopicProps,
  DeleteTopicProps,
  GetTopicInfoProps,
  HcsTopicService,
  UpdateTopicProps,
} from '../../src/hcs';
import { isMirrorQuerySupported, waitForChangesVisibility } from '../../src/shared';
import { HcsCacheService } from '../../src/cache';
import { Signer } from '@hiero-did-sdk/signer-internal';

const {
  mockTopicCreateTransaction,
  mockTopicUpdateTransaction,
  mockTopicDeleteTransaction,
  mockTopicInfoQuery,
  mockSignTransaction,
  mockWaitForChangesVisibility,
  mockGetMirrorNetworkNodeUrl,
  mockIsMirrorQuerySupported,
} = vi.hoisted(() => ({
  mockTopicCreateTransaction: vi.fn(),
  mockTopicUpdateTransaction: vi.fn(),
  mockTopicDeleteTransaction: vi.fn(),
  mockTopicInfoQuery: vi.fn(),
  mockSignTransaction: vi.fn(),
  mockWaitForChangesVisibility: vi.fn(),
  mockGetMirrorNetworkNodeUrl: vi.fn(),
  mockIsMirrorQuerySupported: vi.fn(),
}));

vi.mock('@hiero-ledger/sdk', async () => {
  const actual = await vi.importActual<typeof import('@hiero-ledger/sdk')>('@hiero-ledger/sdk');
  return {
    ...actual,
    Status: { Success: 'SUCCESS', FailInvalid: 'FailInvalid', InvalidTopicId: 'INVALID_TOPIC' },
    TopicCreateTransaction: mockTopicCreateTransaction,
    TopicUpdateTransaction: mockTopicUpdateTransaction,
    TopicDeleteTransaction: mockTopicDeleteTransaction,
    TopicInfoQuery: mockTopicInfoQuery.mockImplementation(function () {
      return {
        setTopicId: vi.fn().mockReturnThis(),
        execute: vi.fn(),
      };
    }),
  };
});

function mockTopicTransaction() {
  return {
    setTopicMemo: vi.fn().mockReturnThis(),
    setSubmitKey: vi.fn().mockReturnThis(),
    setAdminKey: vi.fn().mockReturnThis(),
    setAutoRenewPeriod: vi.fn().mockReturnThis(),
    setAutoRenewAccountId: vi.fn().mockReturnThis(),
    setTopicId: vi.fn().mockReturnThis(),
    setExpirationTime: vi.fn().mockReturnThis(),
    freezeWith: vi.fn().mockReturnThis(),
    sign: vi.fn().mockResolvedValue(undefined),
    signWith: vi.fn().mockResolvedValue(undefined),
    execute: vi.fn(),
  };
}

vi.mock('../../src/shared', async () => {
  const actual = await vi.importActual('../../src/shared');
  return {
    ...actual,
    signTransaction: mockSignTransaction,
    waitForChangesVisibility: mockWaitForChangesVisibility,
    getMirrorNetworkNodeUrl: mockGetMirrorNetworkNodeUrl,
    isMirrorQuerySupported: mockIsMirrorQuerySupported,
  };
});

describe('HcsTopicService', () => {
  const client: vi.Mocked<Client> = {} as vi.Mocked<Client>;
  Object.defineProperty(client, 'mirrorRestApiBaseUrl', { get: vi.fn(), configurable: true });

  const transactionMock: ReturnType<typeof mockTopicTransaction> = mockTopicTransaction();

  transactionMock.freezeWith.mockReturnValue(transactionMock);
  transactionMock.sign.mockResolvedValue(transactionMock);
  transactionMock.execute.mockReset();

  mockTopicCreateTransaction.mockImplementation(function () {
    return transactionMock;
  });
  mockTopicUpdateTransaction.mockImplementation(function () {
    return transactionMock;
  });
  mockTopicDeleteTransaction.mockImplementation(function () {
    return transactionMock;
  });

  const realCacheServiceMock = new HcsCacheService({ maxSize: 100 });

  vi.spyOn(realCacheServiceMock, 'getTopicInfo').mockResolvedValue(undefined);
  vi.spyOn(realCacheServiceMock, 'setTopicInfo').mockResolvedValue(undefined);
  vi.spyOn(realCacheServiceMock, 'removeTopicInfo').mockResolvedValue(undefined);

  const cacheServiceMock = realCacheServiceMock as unknown as vi.Mocked<HcsCacheService>;

  let service: HcsTopicService;

  beforeEach(() => {
    service = new HcsTopicService(client, cacheServiceMock);
  });

  describe('createTopic', () => {
    it('should throw if autoRenewAccountId is provided without autoRenewAccountKey', async () => {
      await expect(service.createTopic({ autoRenewAccountId: '0.0.1' })).rejects.toThrow(
        'The autoRenewAccountKeySigner is required for setting autoRenewAccountId'
      );
    });

    it('should create topic with minimal props', async () => {
      transactionMock.execute.mockResolvedValueOnce({
        getReceipt: vi.fn().mockResolvedValue({ status: Status.Success, topicId: { toString: () => '1.2.3' } }),
      });

      const topicId = await service.createTopic({});
      expect(topicId).toBe('1.2.3');
      expect(transactionMock.freezeWith).toHaveBeenCalledWith(client);
      expect(transactionMock.execute).toHaveBeenCalledWith(client);
    });

    it('should set all properties and sign if keys provided', async () => {
      const adminKey = PrivateKey.generateED25519();
      const submitKey = PrivateKey.generateED25519();
      const autoRenewAccountKey = PrivateKey.generateED25519();

      // Workaround for Hiero SDK internal format inconsistency between PrivateKey.publicKey and "independent" PublicKey instance
      const adminPublicKey = PublicKey.fromString(adminKey.publicKey.toStringDer());
      const submitPublicKey = PublicKey.fromString(submitKey.publicKey.toStringDer());
      const autoRenewAccountPublicKey = PublicKey.fromString(autoRenewAccountKey.publicKey.toStringDer());

      const adminKeySigner = new Signer(adminKey);
      const autoRenewAccountKeySigner = new Signer(autoRenewAccountKey);

      transactionMock.execute.mockResolvedValueOnce({
        getReceipt: vi.fn().mockResolvedValue({ status: Status.Success, topicId: { toString: () => '4.5.6' } }),
      });

      const props: CreateTopicProps = {
        topicMemo: 'TestMemo',
        submitKey: submitPublicKey,
        adminKeySigner,
        autoRenewPeriod: 30 * 24 * 60 * 60 * 1000,
        autoRenewAccountId: '0.0.123',
        autoRenewAccountKeySigner: autoRenewAccountKeySigner,
        waitForChangesVisibility: true,
        waitForChangesVisibilityTimeoutMs: 1000,
      };

      vi.spyOn(service as any, 'fetchTopicInfo').mockResolvedValue({
        topicId: '4.5.6',
        topicMemo: 'TestMemo',
      } as unknown as TopicInfo);

      const topicId = await service.createTopic(props);

      expect(topicId).toBe('4.5.6');
      expect(transactionMock.setTopicMemo).toHaveBeenCalledWith(props.topicMemo);
      expect(transactionMock.setSubmitKey).toHaveBeenCalledWith(submitPublicKey);
      expect(transactionMock.setAdminKey).toHaveBeenCalledWith(adminPublicKey);
      expect(transactionMock.setAutoRenewPeriod).toHaveBeenCalledWith(props.autoRenewPeriod);
      expect(transactionMock.setAutoRenewAccountId).toHaveBeenCalledWith('0.0.123');

      expect(transactionMock.signWith).toHaveBeenCalledWith(autoRenewAccountPublicKey, expect.any(Function));
      expect(transactionMock.signWith).toHaveBeenCalledWith(adminPublicKey, expect.any(Function));
      expect(waitForChangesVisibility).toHaveBeenCalled();
    });

    it('should throw error if receipt.status !== Success', async () => {
      transactionMock.execute.mockResolvedValueOnce({
        getReceipt: vi.fn().mockResolvedValue({ status: Status.FailInvalid, topicId: { toString: () => '1.1.1' } }),
      });
      await expect(service.createTopic({})).rejects.toThrow(/Topic Create transaction failed/);
    });

    it('should throw error if receipt.topicId missing', async () => {
      transactionMock.execute.mockResolvedValueOnce({
        getReceipt: vi.fn().mockResolvedValue({ status: Status.Success }),
      });
      await expect(service.createTopic({})).rejects.toThrow(/Transaction receipt do not contain topicId/);
    });
  });

  describe('updateTopic', () => {
    const currentAdminKey = PrivateKey.generateED25519();

    const currentAdminKeySigner: Signer = new Signer(currentAdminKey);
    const currentAdminPublicKey = PublicKey.fromString(currentAdminKey.publicKey.toStringDer());
    const baseProps: UpdateTopicProps = {
      topicId: '0.0.100',
      currentAdminKeySigner,
    };

    it('should throw if autoRenewAccountId set without autoRenewAccountKey', async () => {
      await expect(service.updateTopic({ ...baseProps, autoRenewAccountId: '0.0.101' })).rejects.toThrow(
        'The autoRenewAccountKeySigner is required for updating autoRenewAccountId'
      );
    });

    it('should update with default values and sign correctly', async () => {
      transactionMock.execute.mockResolvedValueOnce({
        getReceipt: vi.fn().mockResolvedValue({ status: Status.Success }),
      });

      const adminKey = PrivateKey.generateED25519();
      const submitKey = PrivateKey.generateED25519();
      const autoRenewAccountKey = PrivateKey.generateED25519();

      const adminKeySigner = new Signer(adminKey);
      const autoRenewAccountKeySigner = new Signer(autoRenewAccountKey);

      // Workaround for Hiero SDK internal format inconsistency between PrivateKey.publicKey and "independent" PublicKey instance
      const adminPublicKey = PublicKey.fromString(adminKey.publicKey.toStringDer());
      const submitPublicKey = PublicKey.fromString(submitKey.publicKey.toStringDer());
      const autoRenewAccountPublicKey = PublicKey.fromString(autoRenewAccountKey.publicKey.toStringDer());

      const props: UpdateTopicProps = {
        ...baseProps,
        topicMemo: 'newMemo',
        submitKey: submitPublicKey,
        adminKeySigner,
        autoRenewPeriod: 90 * 24 * 60 * 60,
        autoRenewAccountKeySigner,
      };

      vi.spyOn(service as any, 'fetchTopicInfo').mockResolvedValue({
        topicId: props.topicId,
        topicMemo: 'newMemo',
        submitKey: props.submitKey.toStringDer(),
        adminKey: await props.adminKeySigner.publicKey(),
        autoRenewPeriod: 90 * 24 * 60 * 60,
        autoRenewAccountId: undefined,
        expirationTime: undefined,
      } as unknown as TopicInfo);

      await service.updateTopic({ ...props, waitForChangesVisibility: true, waitForChangesVisibilityTimeoutMs: 1234 });

      expect(transactionMock.setTopicId).toHaveBeenCalledWith(props.topicId);
      expect(transactionMock.setTopicMemo).toHaveBeenCalledWith('newMemo');
      expect(transactionMock.setSubmitKey).toHaveBeenCalledWith(submitPublicKey);
      expect(transactionMock.setAdminKey).toHaveBeenCalledWith(adminPublicKey);
      expect(transactionMock.setAutoRenewPeriod).toHaveBeenCalledWith(90 * 24 * 60 * 60);

      expect(transactionMock.freezeWith).toHaveBeenCalledWith(client);
      expect(transactionMock.signWith).toHaveBeenCalledWith(autoRenewAccountPublicKey, expect.any(Function));
      expect(transactionMock.signWith).toHaveBeenCalledWith(adminPublicKey, expect.any(Function));
      expect(transactionMock.signWith).toHaveBeenCalledWith(currentAdminPublicKey, expect.any(Function));
      expect(transactionMock.execute).toHaveBeenCalledWith(client);

      expect(cacheServiceMock.removeTopicInfo).toHaveBeenCalledWith(client, props.topicId);
      expect(waitForChangesVisibility).toHaveBeenCalled();
    });

    it('should throw error if receipt.status !== Success', async () => {
      transactionMock.execute.mockResolvedValueOnce({
        getReceipt: vi.fn().mockResolvedValue({ status: Status.FailInvalid }),
      });

      await expect(service.updateTopic(baseProps)).rejects.toThrow(/Topic update transaction failed/);
    });
  });

  describe('deleteTopic', () => {
    const adminKey = PrivateKey.generateED25519();

    const adminKeySigner: Signer = new Signer(adminKey);
    const adminPublicKey = PublicKey.fromString(adminKey.publicKey.toStringDer());
    const props: DeleteTopicProps = {
      topicId: '0.0.50',
      adminKeySigner,
    };

    it('should delete the topic and wait for changes visibility', async () => {
      transactionMock.freezeWith.mockReturnValueOnce(transactionMock);
      transactionMock.sign.mockResolvedValueOnce(transactionMock);

      transactionMock.execute.mockResolvedValueOnce({
        getReceipt: vi.fn().mockResolvedValue({ status: Status.Success }),
      });

      vi.spyOn(service as any, 'fetchTopicInfo').mockRejectedValueOnce(
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
      expect(transactionMock.signWith).toHaveBeenCalledWith(adminPublicKey, expect.any(Function));
      expect(transactionMock.execute).toHaveBeenCalledWith(client);

      expect(cacheServiceMock.removeTopicInfo).toHaveBeenCalledWith(client, props.topicId);
      expect(waitForChangesVisibility).toHaveBeenCalled();
    });

    it('should throw error if receipt.status !== Success', async () => {
      transactionMock.execute.mockResolvedValueOnce({
        getReceipt: vi.fn().mockResolvedValue({ status: Status.FailInvalid }),
      });

      await expect(service.deleteTopic(props)).rejects.toThrow(/Topic delete transaction failed/);
    });
  });

  describe('getTopicInfo', () => {
    const props: GetTopicInfoProps = { topicId: '0.0.200' };

    it('should return cached info if present', async () => {
      const cached = { topicId: '0.0.200', topicMemo: 'Cached memo' };

      cacheServiceMock.getTopicInfo.mockResolvedValueOnce(cached);

      const res = await service.getTopicInfo(props);

      expect(res).toBe(cached);
      expect(cacheServiceMock.getTopicInfo).toHaveBeenCalledWith(client, props.topicId);
      expect(cacheServiceMock.setTopicInfo).not.toHaveBeenCalled();
    });

    it('should fetch info if no cache, then set cache', async () => {
      cacheServiceMock.getTopicInfo.mockResolvedValueOnce(undefined);
      const fetched = { topicId: TopicId.fromString('0.0.200'), topicMemo: 'Fetched memo' };
      vi.spyOn(service as any, 'fetchTopicInfo').mockResolvedValueOnce(fetched);

      const res = await service.getTopicInfo(props);

      expect(res).toEqual(fetched);
      expect(cacheServiceMock.getTopicInfo).toHaveBeenCalledWith(client, props.topicId);
      expect(cacheServiceMock.setTopicInfo).toHaveBeenCalledWith(client, props.topicId, fetched);
    });
  });

  describe('fetchTopicInfo', () => {
    it('should call fetchTopicInfoWithClient if mirror supported', async () => {
      (isMirrorQuerySupported as vi.Mock).mockReturnValue(true);
      const spy = vi
        .spyOn(service as any, 'fetchTopicInfoWithClient')
        .mockResolvedValue({ topicId: 'topic123', topicMemo: 'memo' });
      const res = (await (service as any).fetchTopicInfo({ topicId: 'topic123' })) as unknown as TopicInfo;

      expect(spy).toHaveBeenCalled();
      expect(res.topicId).toBe('topic123');
    });

    it('should call fetchTopicInfoWithRest if mirror not supported', async () => {
      (isMirrorQuerySupported as vi.Mock).mockReturnValue(false);
      const spy = vi
        .spyOn(service as any, 'fetchTopicInfoWithRest')
        .mockResolvedValue({ topicId: 'topic456', topicMemo: 'memo2' });
      const res = await (service as any).fetchTopicInfo({ topicId: 'topic456' } as unknown as TopicInfo);

      expect(spy).toHaveBeenCalled();
      expect(res.topicId).toBe('topic456');
    });
  });

  describe('fetchTopicInfoWithClient', () => {
    it('should correctly transform info from SDK', async () => {
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
        expirationTime: {
          toDate: () => ({
            getTime: () => 67890,
          }),
        },
      };

      (TopicInfoQuery as unknown as vi.Mock).mockImplementation(function () {
        return {
          setTopicId: vi.fn().mockReturnThis(),
          execute: vi.fn().mockResolvedValue(mockInfo),
        };
      });
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
      global.fetch = vi.fn();
      vi.spyOn(client, 'mirrorRestApiBaseUrl', 'get').mockReturnValue('https://test-node/api/v1');
    });

    afterEach(() => {
      vi.resetAllMocks();
    });

    it('should fetch info from REST and transform data', async () => {
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

      (global.fetch as vi.Mock).mockResolvedValue({
        ok: true,
        json: vi.fn().mockResolvedValue(fetchedData),
      });
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

    it('should throw error if fetch response is not ok', async () => {
      (global.fetch as vi.Mock).mockResolvedValue({
        ok: false,
        statusText: 'Not Found',
      });
      await expect((service as any).fetchTopicInfoWithRest({ topicId: '0.0.99' })).rejects.toThrow(
        /Failed to fetch topic info: Not Found/
      );
    });

    it('should throw StatusError with InvalidTopicId if topic marked deleted', async () => {
      const deletedData = {
        deleted: true,
        topic_id: '0.0.100',
        memo: '',
      };
      (global.fetch as vi.Mock).mockResolvedValue({
        ok: true,
        json: vi.fn().mockResolvedValue(deletedData),
      });
      await expect((service as any).fetchTopicInfoWithRest({ topicId: '0.0.100' })).rejects.toThrow(StatusError);
    });
  });

  describe('convertExpirationTimeToSeconds', () => {
    it('should convert Timestamp instance correctly', () => {
      const date = new Date(1600000000000);
      const timestamp = new Timestamp(date.getTime() / 1000, 0);
      const result = (service as any).convertExpirationTimeToSeconds(timestamp);
      expect(result).toBe(Math.floor(date.getTime()));
    });

    it('should convert Date instance correctly', () => {
      const date = new Date(1600000000000);
      const result = (service as any).convertExpirationTimeToSeconds(date);
      expect(result).toBe(Math.floor(date.getTime()));
    });

    it('should throw error on unsupported type', () => {
      expect(() => (service as any).convertExpirationTimeToSeconds(undefined)).toThrow(
        'Unsupported expirationTime type'
      );
    });
  });
});
