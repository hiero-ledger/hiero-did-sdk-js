import { Client, PrivateKey } from '@hashgraph/sdk';
import { HederaNetwork } from '@hiero-did-sdk/client';
import { HederaHcsService } from '../../src/hedera-hcs-service';
import { Buffer } from 'buffer';
import { v4 as uuidv4 } from 'uuid';
import { Cache } from '@hiero-did-sdk/core';

const network = (process.env.HEDERA_NETWORK as HederaNetwork) ?? 'testnet';
const operatorId = process.env.HEDERA_OPERATOR_ID ?? '';
const operatorKey = process.env.HEDERA_OPERATOR_KEY ?? '';

const TEST_VARIANTS = [
  { useRestAPI: false, name: 'Client' },
  { useRestAPI: true, name: 'REST API' },
];

describe('Hedera HCS Service', () => {
  jest.setTimeout(60000);

  const mockCache: Cache = {
    get: jest.fn(),
    set: jest.fn(),
    remove: jest.fn(),
    clear: jest.fn(),
    cleanupExpired: jest.fn(),
  };

  describe.each(TEST_VARIANTS)('Using $name', ({ useRestAPI }) => {
    const ledgerService = new HederaHcsService({
      networks: [
        {
          network,
          operatorId,
          operatorKey,
        },
      ],
      cache: mockCache,
    });

    beforeAll(() => {
      global.UseRestAPI = useRestAPI;

      jest
        // eslint-disable-next-line @typescript-eslint/no-require-imports
        .spyOn(require('../../src/shared/mirror-node'), 'isMirrorQuerySupported')
        .mockImplementation((_: Client) => {
          return !global.UseRestAPI;
        });
    });

    afterEach(() => {
      jest.clearAllMocks();
    });

    afterAll(() => {
      jest.restoreAllMocks();
    });

    it('Create topic', async () => {
      const topicMemo = '1234567890';
      const autoRenewPeriod = 90 * 24 * 60 * 60; // sec
      const topicId = await ledgerService.createTopic({
        topicMemo,
        submitKey: PrivateKey.fromStringDer(operatorKey),
        adminKey: PrivateKey.fromStringDer(operatorKey),
        autoRenewPeriod,
        autoRenewAccountId: operatorId,
        autoRenewAccountKey: PrivateKey.fromStringDer(operatorKey),
        waitForChangesVisibility: true,
      });
      expect(topicId).toBeDefined();
      const topicInfo = await ledgerService.getTopicInfo({
        topicId: topicId.toString(),
      });
      expect(topicInfo.topicMemo).toEqual(topicMemo);
      expect(topicInfo.submitKey).toEqual(PrivateKey.fromStringDer(operatorKey).publicKey.toStringRaw());
      expect(topicInfo.adminKey).toEqual(PrivateKey.fromStringDer(operatorKey).publicKey.toStringRaw());
      expect(topicInfo.autoRenewPeriod).toEqual(autoRenewPeriod);
      expect(topicInfo.autoRenewAccountId).toEqual(operatorId);
    });

    it('Get topic info', async () => {
      // Create topic
      const topicMemo = '1234567890';
      const topicId = await ledgerService.createTopic({
        topicMemo,
        adminKey: PrivateKey.fromStringDer(operatorKey),
        waitForChangesVisibility: true,
      });
      expect(topicId).toBeDefined();

      // Resolve topic info
      const topicInfo = await ledgerService.getTopicInfo({ topicId });
      expect(topicInfo).toBeDefined();
      expect(topicInfo.topicMemo).toEqual(topicMemo);
      expect(topicInfo.adminKey).toEqual(PrivateKey.fromStringDer(operatorKey).publicKey.toStringRaw());
      expect(topicInfo.submitKey).toBeUndefined();
    });

    it('Update topic', async () => {
      const submit1Key = PrivateKey.generate();
      const submit2Key = PrivateKey.generate();
      const admin1Key = PrivateKey.generate();
      const admin2Key = PrivateKey.generate();

      const renewAccountId = '0.0.5065521';
      const renewAccountKey =
        '302e020100300506032b657004220420e4f76aa303bfbf350ad080b879173b31977e5661d51ff5932f6597e2bb6680ff';

      // Create the test topic
      const topicMemo = '1234567890';
      const topicId = await ledgerService.createTopic({
        topicMemo,
        adminKey: admin1Key,
        waitForChangesVisibility: true,
      });
      expect(topicId).toBeDefined();

      // Set full set of the properties to the topic
      const newTopicMemo = '0987654321';
      const newAutoRenewPeriod = 60 * 24 * 60 * 60; // sec

      const newExpirationTime = new Date();
      newExpirationTime.setMonth(newExpirationTime.getMonth() + 3);
      // HCS do not use millisecond precision for Topic expiration time
      newExpirationTime.setMilliseconds(0);

      await ledgerService.updateTopic({
        topicId,
        currentAdminKey: admin1Key,
        submitKey: submit1Key,
        topicMemo: newTopicMemo,
        autoRenewPeriod: newAutoRenewPeriod,
        autoRenewAccountId: renewAccountId,
        autoRenewAccountKey: PrivateKey.fromStringDer(renewAccountKey),
        expirationTime: newExpirationTime,
        waitForChangesVisibility: true,
      });

      let topicInfo = await ledgerService.getTopicInfo({ topicId });
      expect(topicInfo.topicMemo).toEqual(newTopicMemo);
      expect(topicInfo.submitKey).toEqual(submit1Key.publicKey.toStringRaw());
      expect(topicInfo.adminKey).toEqual(admin1Key.publicKey.toStringRaw());
      expect(topicInfo.autoRenewPeriod).toEqual(newAutoRenewPeriod);
      expect(topicInfo.autoRenewAccountId).toEqual(renewAccountId);
      if (topicInfo.expirationTime) expect(topicInfo.expirationTime).toEqual(newExpirationTime.getTime());

      // Change memo, renew period, admin and submit keys
      const nextNewTopicMemo = 'the new memo';
      const nextNewAutoRenewPeriod = 87 * 24 * 60 * 60; // sec
      await ledgerService.updateTopic({
        topicId,
        currentAdminKey: admin2Key,
        submitKey: submit2Key,
        adminKey: admin1Key,
        topicMemo: nextNewTopicMemo,
        autoRenewPeriod: nextNewAutoRenewPeriod,
        waitForChangesVisibility: true,
      });

      topicInfo = await ledgerService.getTopicInfo({ topicId });
      expect(topicInfo.topicMemo).toEqual(nextNewTopicMemo);
      expect(topicInfo.submitKey).toEqual(submit2Key.publicKey.toStringRaw());
      expect(topicInfo.adminKey).toEqual(admin1Key.publicKey.toStringRaw());
      expect(topicInfo.autoRenewPeriod).toEqual(nextNewAutoRenewPeriod);
      expect(topicInfo.autoRenewAccountId).toEqual(renewAccountId);
      if (topicInfo.expirationTime) expect(topicInfo.expirationTime).toEqual(newExpirationTime.getTime());

      // Clear auto re-new account
      await ledgerService.updateTopic({
        topicId,
        currentAdminKey: admin1Key,
        autoRenewAccountId: operatorId,
        autoRenewAccountKey: PrivateKey.fromStringDer(operatorKey),
        waitForChangesVisibility: true,
      });

      topicInfo = await ledgerService.getTopicInfo({ topicId });
      expect(topicInfo.topicMemo).toEqual(nextNewTopicMemo);
      expect(topicInfo.submitKey).toEqual(submit2Key.publicKey.toStringRaw());
      expect(topicInfo.adminKey).toEqual(admin1Key.publicKey.toStringRaw());
      expect(topicInfo.autoRenewPeriod).toEqual(nextNewAutoRenewPeriod);
      expect(topicInfo.autoRenewAccountId).toEqual(operatorId);
      if (topicInfo.expirationTime) expect(topicInfo.expirationTime).toEqual(newExpirationTime.getTime());

      // Set admin and submit keys to be the same
      await ledgerService.updateTopic({
        topicId,
        currentAdminKey: admin1Key,
        adminKey: admin2Key,
        submitKey: admin2Key,
        waitForChangesVisibility: true,
      });

      topicInfo = await ledgerService.getTopicInfo({ topicId });
      expect(topicInfo.topicMemo).toEqual(nextNewTopicMemo);
      expect(topicInfo.submitKey).toEqual(admin2Key.publicKey.toStringRaw());
      expect(topicInfo.adminKey).toEqual(admin2Key.publicKey.toStringRaw());
      expect(topicInfo.autoRenewPeriod).toEqual(nextNewAutoRenewPeriod);
      expect(topicInfo.autoRenewAccountId).toEqual(operatorId);
      if (topicInfo.expirationTime) expect(topicInfo.expirationTime).toEqual(newExpirationTime.getTime());
    });

    it('Delete topic', async () => {
      const topicMemo = '1234567890';
      const topicId = await ledgerService.createTopic({
        topicMemo,
        adminKey: PrivateKey.fromStringDer(operatorKey),
        waitForChangesVisibility: true,
      });
      expect(topicId).toBeDefined();

      const topicInfo = await ledgerService.getTopicInfo({ topicId });
      expect(topicInfo).toBeDefined();

      await ledgerService.deleteTopic({
        topicId,
        currentAdminKey: PrivateKey.fromStringDer(operatorKey),
        waitForChangesVisibility: true,
      });

      await expect(ledgerService.getTopicInfo({ topicId })).rejects.toThrow(
        // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
        expect.objectContaining({
          name: 'StatusError',
          message: expect.stringMatching(/INVALID_TOPIC_ID/),
        })
      );
    });

    it('Submit HCS-1 file', async () => {
      const content = `___${uuidv4()}___`;
      const fileTopicId = await ledgerService.submitFile({
        payload: Buffer.from(content),
        waitForChangesVisibility: true,
      });
      expect(fileTopicId).toBeDefined();
    });

    it('Resolve HCS-1 file', async () => {
      // Submit file
      const content = `___${uuidv4()}___`;
      const topicId = await ledgerService.submitFile({
        payload: Buffer.from(content),
        waitForChangesVisibility: true,
      });
      expect(topicId).toBeDefined();

      // Resolve submitted file
      const resolvedFile = await ledgerService.resolveFile({ topicId });
      expect(resolvedFile.toString()).toEqual(content);
    });

    it('Submit message', async () => {
      // Create topic
      const topicId = await ledgerService.createTopic({
        topicMemo: 'test',
        waitForChangesVisibility: true,
      });
      expect(topicId).toBeDefined();

      // Submit message
      const message = 'test message';
      const messageTransactionId = await ledgerService.submitMessage({
        topicId,
        message,
        waitForChangesVisibility: true,
      });
      expect(messageTransactionId).toBeDefined();
    });

    it('Submit message to private topic', async () => {
      const submitKey = PrivateKey.generate();

      // Create topic
      const topicId = await ledgerService.createTopic({
        topicMemo: 'test',
        submitKey,
        waitForChangesVisibility: true,
      });
      expect(topicId).toBeDefined();

      // Submit message without signature
      await expect(
        ledgerService.submitMessage({
          topicId,
          message: 'test message',
          waitForChangesVisibility: true,
        })
      ).rejects.toThrow();

      // Submit message with signature
      const messageTransactionId = await ledgerService.submitMessage({
        topicId,
        message: 'test message',
        submitKey,
        waitForChangesVisibility: true,
      });
      expect(messageTransactionId).toBeDefined();
    });

    it('Get messages', async () => {
      // Create topic
      const topicId = await ledgerService.createTopic({
        topicMemo: '',
        waitForChangesVisibility: true,
      });
      expect(topicId).toBeDefined();

      // Submit messages
      const messageTransactionId_1 = await ledgerService.submitMessage({
        topicId,
        message: 'test message 1',
        waitForChangesVisibility: true,
      });
      expect(messageTransactionId_1).toBeDefined();
      const messageTransactionId_2 = await ledgerService.submitMessage({
        topicId,
        message: 'test message 2',
        waitForChangesVisibility: true,
      });
      expect(messageTransactionId_2).toBeDefined();

      // Resolve messages
      const messages = await ledgerService.getTopicMessages({ topicId });
      expect(messages).toBeDefined();
      expect(messages).toHaveLength(2);
    });
  });
});
