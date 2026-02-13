import { PrivateKey, Timestamp } from '@hashgraph/sdk';
import { HederaHcsService } from '../../src/hedera-hcs-service';
import { HederaNetwork, NetworkConfig } from '@hiero-did-sdk/client';
import { Buffer } from 'buffer';
import { Signer } from '@hiero-did-sdk/signer-internal';
import { vi } from 'vitest';

const network = (process.env.HEDERA_NETWORK as HederaNetwork) ?? 'testnet';
const operatorId = process.env.HEDERA_OPERATOR_ID ?? '0.0.123';
const operatorKey = process.env.HEDERA_OPERATOR_KEY ?? '302e020100300506032b65700422042091132178e72057a1d7528025956fe39b0b847f200ab59b2fdd367017f3087137';

let operatorKeyInstance: PrivateKey;
let operatorKeySigner: Signer;

const networkConfigs: NetworkConfig[] = [
  {
    network,
    operatorId,
    operatorKey,
  },
];

beforeAll(() => {
  operatorKeyInstance = PrivateKey.fromStringDer(operatorKey);
  operatorKeySigner = new Signer(operatorKeyInstance);
});

vi.mock('../../src/hcs/hcs-topic-service', () => ({
  HcsTopicService: vi.fn().mockImplementation(function() {
    return {
      createTopic: vi.fn().mockReturnValue('MOCK_TOPIC_ID'),
      updateTopic: vi.fn(),
      deleteTopic: vi.fn(),
      getTopicInfo: vi.fn().mockReturnValue({
        topicId: 'MOCK_TOPIC_ID',
        topicMemo: 'MOCK_TOPIC_MEMO',
        adminKey: false,
        submitKey: false,
      }),
    };
  }),
}));

vi.mock('../../src/hcs/hcs-message-service', () => ({
  HcsMessageService: vi.fn().mockImplementation(function() {
    return {
      submitMessage: vi.fn().mockReturnValue({
        nodeId: 'MOCK_NODE_ID',
        transactionId: 'MOCK_TX_ID',
        transactionHash: [],
      }),
      getTopicMessages: vi.fn().mockReturnValue([
        {
          consensusTimestamp: new Timestamp(0, 0),
          contents: [1, 2, 3, 4, 5],
        },
        {
          consensusTimestamp: new Timestamp(10, 0),
          contents: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10],
        },
      ]),
    };
  }),
}));

vi.mock('../../src/hcs/hcs-file-service', () => ({
  HcsFileService: vi.fn().mockImplementation(function() {
    return {
      submitFile: vi.fn().mockReturnValue('MOCK_FILE_TOPIC_ID'),
      resolveFile: vi.fn().mockReturnValue(Buffer.from('MOCK_FILE_CONTENT')),
    };
  }),
}));

describe('Hedera HCS networks configuration', () => {
  it('Init with empty networks', () => {
    expect(() => {
      new HederaHcsService({
        networks: [],
      });
    }).toThrow('Networks must not be empty');
  });

  it('Init with duplicated network names', () => {
    expect(() => {
      new HederaHcsService({
        networks: [
          {
            network: 'testnet',
            operatorId,
            operatorKey,
          },
          {
            network: {
              name: 'testnet',
              nodes: {
                '0.testnet.hedera.com:50211': '0.0.3',
                '1.testnet.hedera.com:50211': '0.0.4',
              },
            },
            operatorId,
            operatorKey,
          },
        ],
      });
    }).toThrow('Network names must be unique');
  });

  it('Using one network without required network name', async () => {
    const ledgerService = new HederaHcsService({ networks: networkConfigs });

    // Topic service
    const createTopicResult = await ledgerService.createTopic();
    expect(createTopicResult).toBeDefined();
    const getTopicInfoResult = await ledgerService.getTopicInfo({ topicId: 'topicId' });
    expect(getTopicInfoResult.topicId).toBeDefined();
    await expect(
      ledgerService.updateTopic({ topicId: 'topicId', currentAdminKeySigner: operatorKeySigner })
    ).resolves.not.toThrow();
    await expect(
      ledgerService.deleteTopic({ topicId: 'topicId', adminKeySigner: operatorKeySigner })
    ).resolves.not.toThrow();

    // Message service
    const submitMessageResult = await ledgerService.submitMessage({
      topicId: 'topicId',
      message: 'message',
    });
    expect(submitMessageResult).toBeDefined();
    const getMessagesResult = await ledgerService.getTopicMessages({ topicId: 'topicId' });
    expect(getMessagesResult.length).toEqual(2);

    // File service
    const submitFileResult = await ledgerService.submitFile({
      payload: Buffer.from('test'),
      submitKeySigner: new Signer(PrivateKey.generate()),
    });
    expect(submitFileResult).toBeDefined();
    const resolveFileResult = await ledgerService.resolveFile({ topicId: 'topicId' });
    expect(resolveFileResult).toBeDefined();
  });

  it('Using one network with correct required network name', async () => {
    const networkName = network;

    const ledgerService = new HederaHcsService({ networks: networkConfigs });

    // Topic service
    const createTopicResult = await ledgerService.createTopic({ networkName });
    expect(createTopicResult).toBeDefined();
    const getTopicInfoResult = await ledgerService.getTopicInfo({ networkName, topicId: 'topicId' });
    expect(getTopicInfoResult.topicId).toBeDefined();

    // Message service
    const submitMessageResult = await ledgerService.submitMessage({
      networkName,
      topicId: 'topicId',
      message: 'message',
    });
    expect(submitMessageResult).toBeDefined();
    const getMessagesResult = await ledgerService.getTopicMessages({ networkName, topicId: 'topicId' });
    expect(getMessagesResult.length).toEqual(2);

    // File service
    const submitFileResult = await ledgerService.submitFile({
      networkName,
      payload: Buffer.from('test'),
      submitKeySigner: new Signer(PrivateKey.generate()),
    });
    expect(submitFileResult).toBeDefined();
    const resolveFileResult = await ledgerService.resolveFile({ networkName, topicId: 'topicId' });
    expect(resolveFileResult).toBeDefined();
  });

  it('Using one network with incorrect required network name', async () => {
    const networkName = 'custom-net';

    const ledgerService = new HederaHcsService({ networks: networkConfigs });

    // Topic service
    await expect(ledgerService.createTopic({ networkName })).rejects.toThrow('Unknown Hedera network');
    await expect(ledgerService.getTopicInfo({ networkName, topicId: 'topicId' })).rejects.toThrow(
      'Unknown Hedera network'
    );

    // Message service
    await expect(
      ledgerService.submitMessage({
        networkName,
        topicId: 'topicId',
        message: 'message',
      })
    ).rejects.toThrow('Unknown Hedera network');
    await expect(ledgerService.getTopicMessages({ networkName, topicId: 'topicId' })).rejects.toThrow(
      'Unknown Hedera network'
    );

    // File service
    await expect(
      ledgerService.submitFile({
        networkName,
        submitKeySigner: new Signer(PrivateKey.generate()),
        payload: Buffer.from('test'),
      })
    ).rejects.toThrow('Unknown Hedera network');
    await expect(ledgerService.resolveFile({ networkName, topicId: 'topicId' })).rejects.toThrow(
      'Unknown Hedera network'
    );
  });

  it('Using many networks without required network name', async () => {
    const ledgerService = new HederaHcsService({
      networks: [
        { network: 'testnet', operatorId, operatorKey },
        { network: 'previewnet', operatorId, operatorKey },
      ],
    });

    // Topic service
    await expect(ledgerService.createTopic()).rejects.toThrow('Unknown Hedera network');
    await expect(ledgerService.getTopicInfo({ topicId: 'topicId' })).rejects.toThrow('Unknown Hedera network');

    // Message service
    await expect(
      ledgerService.submitMessage({
        topicId: 'topicId',
        message: 'message',
      })
    ).rejects.toThrow('Unknown Hedera network');
    await expect(ledgerService.getTopicMessages({ topicId: 'topicId' })).rejects.toThrow('Unknown Hedera network');

    // File service
    await expect(
      ledgerService.submitFile({
        payload: Buffer.from('test'),
        submitKeySigner: new Signer(PrivateKey.generate()),
      })
    ).rejects.toThrow('Unknown Hedera network');
    await expect(ledgerService.resolveFile({ topicId: 'topicId' })).rejects.toThrow('Unknown Hedera network');
  });

  it('Using many networks with correct required network name', async () => {
    const networkName = 'testnet';

    const ledgerService = new HederaHcsService({
      networks: [
        { network: 'testnet', operatorId, operatorKey },
        { network: 'previewnet', operatorId, operatorKey },
      ],
    });

    // Topic service
    const createTopicResult = await ledgerService.createTopic({ networkName });
    expect(createTopicResult).toBeDefined();
    const getTopicInfoResult = await ledgerService.getTopicInfo({ networkName, topicId: 'topicId' });
    expect(getTopicInfoResult.topicId).toBeDefined();

    // Message service
    const submitMessageResult = await ledgerService.submitMessage({
      networkName,
      topicId: 'topicId',
      message: 'message',
    });
    expect(submitMessageResult).toBeDefined();
    const getMessagesResult = await ledgerService.getTopicMessages({ networkName, topicId: 'topicId' });
    expect(getMessagesResult.length).toEqual(2);

    // File service
    const submitFileResult = await ledgerService.submitFile({
      networkName,
      payload: Buffer.from('test'),
      submitKeySigner: new Signer(PrivateKey.generate()),
    });
    expect(submitFileResult).toBeDefined();
    const resolveFileResult = await ledgerService.resolveFile({ networkName, topicId: 'topicId' });
    expect(resolveFileResult).toBeDefined();
  });

  it('Using many networks with incorrect required network name', async () => {
    const ledgerService = new HederaHcsService({
      networks: [
        { network: 'testnet', operatorId, operatorKey },
        { network: 'previewnet', operatorId, operatorKey },
      ],
    });

    // Topic service
    await expect(ledgerService.createTopic()).rejects.toThrow('Unknown Hedera network');
    await expect(ledgerService.getTopicInfo({ topicId: 'topicId' })).rejects.toThrow('Unknown Hedera network');

    // Message service
    await expect(
      ledgerService.submitMessage({
        topicId: 'topicId',
        message: 'message',
      })
    ).rejects.toThrow('Unknown Hedera network');
    await expect(ledgerService.getTopicMessages({ topicId: 'topicId' })).rejects.toThrow('Unknown Hedera network');

    // File service
    await expect(
      ledgerService.submitFile({
        payload: Buffer.from('test'),
        submitKeySigner: new Signer(PrivateKey.generate()),
      })
    ).rejects.toThrow('Unknown Hedera network');
    await expect(ledgerService.resolveFile({ topicId: 'topicId' })).rejects.toThrow('Unknown Hedera network');
  });
});
