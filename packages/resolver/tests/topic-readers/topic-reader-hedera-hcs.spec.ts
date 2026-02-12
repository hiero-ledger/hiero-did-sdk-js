import { TopicReaderHederaHcs } from '../../src/topic-readers';
import {  HederaHcsServiceConfiguration } from '@hiero-did-sdk/hcs';
import { Buffer } from 'buffer';
import { vi } from 'vitest';

const operatorId = '0.0.123'
const operatorKey = 'xxxxx'

const { getTopicMessagesMock, hederaHcsServiceMock } = vi.hoisted(() => ({
  getTopicMessagesMock: vi.fn(),
  hederaHcsServiceMock: vi.fn(),
}));

vi.mock('@hiero-did-sdk/hcs', async () => {
  const actual = await vi.importActual<typeof import('@hiero-did-sdk/hcs')>('@hiero-did-sdk/hcs');
  return {
    ...actual,
    HederaHcsService: hederaHcsServiceMock,
  };
});

describe('Topic Reader Hedera HCS', () => {
  beforeEach(() => {
    vi.clearAllMocks();

    hederaHcsServiceMock.mockImplementation(function() {
      return {
        getTopicMessages: getTopicMessagesMock,
      };
    });
  });

  it('should create a new instance of TopicReaderHederaHcs', () => {
    const config: HederaHcsServiceConfiguration = {
      networks: [{ network: 'testnet', operatorId, operatorKey }],
    };
    const topicReader = new TopicReaderHederaHcs(config);
    expect(topicReader).toBeDefined();
  });

  it('should fetch all messages from a topic to the current date', async () => {
    const config: HederaHcsServiceConfiguration = {
      networks: [{ network: 'testnet', operatorId, operatorKey  }],
    };
    const topicReader = new TopicReaderHederaHcs(config);
    getTopicMessagesMock.mockResolvedValueOnce([
      { contents: Buffer.from('message1') },
      { contents: Buffer.from('message2') },
    ]);

    const messages = await topicReader.fetchAllToDate('0.0.123', 'testnet');
    expect(messages).toEqual(['message1', 'message2']);
  });

  it('should fetch messages from a specific time range', async () => {
    const config: HederaHcsServiceConfiguration = {
      networks: [{ network: 'testnet', operatorId, operatorKey  }],
    };
    const topicReader = new TopicReaderHederaHcs(config);
    getTopicMessagesMock.mockResolvedValueOnce([
      { contents: Buffer.from('message1') },
    ]);

    const messages = await topicReader.fetchFrom('0.0.123', 'testnet', {
      from: 1609459200000, // 2021-01-01
      to: 1612137600000,   // 2021-02-01
    });

    expect(messages).toEqual(['message1']);
    expect(getTopicMessagesMock).toHaveBeenCalledWith({
      topicId: '0.0.123',
      networkName: 'testnet',
      toDate: new Date(1612137600000),
    });
  });

  it('should handle errors when fetching messages', async () => {
    const config: HederaHcsServiceConfiguration = {
      networks: [{ network: 'testnet', operatorId, operatorKey  }],
    };
    const topicReader = new TopicReaderHederaHcs(config);
    getTopicMessagesMock.mockRejectedValueOnce(new Error('Fetch error'));

    await expect(topicReader.fetchAllToDate('0.0.123', 'testnet')).rejects.toThrowError('Fetch error');
  });

  it('should parse topic message contents to string', () => {
    const config: HederaHcsServiceConfiguration = {
      networks: [{ network: 'testnet', operatorId, operatorKey  }],
    };
    const topicReader = new TopicReaderHederaHcs(config);
    const content = Buffer.from('test-message');
    expect(topicReader['parseMessage'](content)).toEqual('test-message');
  });
});
