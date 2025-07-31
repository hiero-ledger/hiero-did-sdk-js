import { Network } from '@hiero-did-sdk/core';
import { TopicReaderHederaRestApi } from '../../src/topic-readers/topic-reader-hedera-rest-api';
import { Buffer } from 'buffer';

describe('Topic Reader Hedera REST API', () => {
  const mockResponse = (
    response: {
      messages: string[];
      links: { next: string | null };
    }[],
  ) => {
    const responsesArray = response.map((response) => ({
      messages: response.messages.map((message) => ({
        message: Buffer.from(message).toString('base64'),
      })),
      links: { next: response.links.next },
    }));

    const mockFetch = jest.fn();
    global.fetch = mockFetch;

    responsesArray.forEach((response) => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: jest.fn().mockResolvedValue(response),
      });
    });
  };

  beforeEach(() => {
    jest.clearAllMocks();
    global.fetch = jest.fn();
  });

  it('should create a new instance with the default network map', () => {
    const topicReader = new TopicReaderHederaRestApi();
    expect(topicReader).toBeDefined();
    expect(topicReader['map']).toEqual(
      TopicReaderHederaRestApi.DEFAULT_NETWORK_MAP,
    );
  });

  it('should create a new instance with a custom network map', () => {
    const customNetworkMap = {
      mainnet: 'https://custom-mainnet.hedera.com',
      testnet: 'https://custom-testnet.hedera.com',
      previewnet: 'https://custom-previewnet.hedera.com',
      'local-node': 'https://custom-local-node.hedera.com',
    };
    const topicReader = new TopicReaderHederaRestApi(customNetworkMap);
    expect(topicReader).toBeDefined();
    expect(topicReader['map']).toEqual(customNetworkMap);
  });

  it('should call fetchFrom with the correct parameters', async () => {
    const topicReader = new TopicReaderHederaRestApi();
    const topicId = '0.0.123';
    const network: Network = 'testnet';

    const fromMock = jest.spyOn(topicReader, 'fetchFrom');
    fromMock.mockResolvedValueOnce([]);

    await topicReader.fetchAllToDate(topicId, network);

    expect(fromMock).toHaveBeenCalledTimes(1);
    expect(fromMock).toHaveBeenCalledWith(
      topicId,
      network,
      expect.objectContaining({ from: 0, to: expect.any(Number) }),
    );
  });

  it('should result with fetchFrom result', async () => {
    const topicReader = new TopicReaderHederaRestApi();
    const topicId = '0.0.123';
    const network: Network = 'testnet';

    const fromMock = jest.spyOn(topicReader, 'fetchFrom');
    fromMock.mockResolvedValueOnce(['test message 1', 'test message 2']);

    const result = await topicReader.fetchAllToDate(topicId, network);

    expect(result).toEqual(['test message 1', 'test message 2']);
  });

  it('should fetch all messages from a specific time range', async () => {
    const topicReader = new TopicReaderHederaRestApi();
    const topicId = '0.0.123';
    const network: Network = 'testnet';

    mockResponse([
      { messages: ['test message 1', 'test message 2'], links: { next: null } },
    ]);

    const result = await topicReader.fetchFrom(topicId, network, {
      from: 1609459200,
      to: 1612137600,
    });

    expect(result).toEqual(['test message 1', 'test message 2']);
    expect(global.fetch).toHaveBeenCalledTimes(1);
    expect(global.fetch).toHaveBeenCalledWith(
      'https://testnet.mirrornode.hedera.com/api/v1/topics/0.0.123/messages?timestamp=gte%3A1609459.200000000&timestamp=lte%3A1612137.600000000&limit=25&encoding=base64',
      {
        method: 'GET',
        headers: {
          Accept: 'application/json',
        },
      },
    );
  });

  it('should fetch multiple pages of messages', async () => {
    const topicReader = new TopicReaderHederaRestApi();
    const topicId = '0.0.123';
    const network: Network = 'testnet';

    const mockResponse1 = {
      messages: ['test message 1', 'test message 2'],
      links: {
        next: '/api/v1/topics/0.0.123/messages?timestamp=gte%3A1609459200000&timestamp=lte%3A1612137600000&next=1',
      },
    };

    const mockResponse2 = {
      messages: ['test message 3', 'test message 4'],
      links: { next: null },
    };

    mockResponse([mockResponse1, mockResponse2]);

    const result = await topicReader.fetchFrom(topicId, network, {
      from: 1609459200,
      to: 1612137600,
    });

    expect(result).toEqual([
      'test message 1',
      'test message 2',
      'test message 3',
      'test message 4',
    ]);
    expect(global.fetch).toHaveBeenCalledTimes(2);
    expect(global.fetch).toHaveBeenNthCalledWith(
      1,
      'https://testnet.mirrornode.hedera.com/api/v1/topics/0.0.123/messages?timestamp=gte%3A1609459.200000000&timestamp=lte%3A1612137.600000000&limit=25&encoding=base64',
      expect.anything(),
    );
    expect(global.fetch).toHaveBeenNthCalledWith(
      2,
      'https://testnet.mirrornode.hedera.com/api/v1/topics/0.0.123/messages?timestamp=gte%3A1609459200000&timestamp=lte%3A1612137600000&next=1&limit=25&encoding=base64',
      expect.anything(),
    );
  });

  describe('getNextUrl()', () => {
    it('should construct the correct URL with parameters', () => {
      const topicReader = new TopicReaderHederaRestApi();

      const network: Network = 'testnet';
      const apiUrl = TopicReaderHederaRestApi['DEFAULT_NETWORK_MAP'][network];
      const nextPath = `/api/v1/topics/0.0.123/messages?timestamp=gte%3A1609459200000&timestamp=lte%3A1612137600000`;

      const result = topicReader['getNextUrl'](network, nextPath);
      expect(result).toEqual(`${apiUrl}${nextPath}&limit=25&encoding=base64`);
    });

    it('should throw an error if the network is not supported', () => {
      const topicReader = new TopicReaderHederaRestApi();
      const network: Network = 'unsupported-network' as Network;
      const nextPath =
        '/api/v1/topics/0.0.123/messages?timestamp=gte%3A1609459200000&timestamp=lte%3A1612137600000';

      expect(() => topicReader['getNextUrl'](network, nextPath)).toThrow(
        'Trying to fetch messages from unsupported network: unsupported-network.',
      );
    });

    it('should remove trailing slash from the API URL', () => {
      const networkMap = {
        testnet: 'https://testnet.hedera.com/',
      };
      const topicReader = new TopicReaderHederaRestApi(networkMap as never);

      const network: Network = 'testnet';
      const nextPath = `/api/v1/topics/0.0.123/messages`;

      const result = topicReader['getNextUrl'](network, nextPath);
      expect(result).toEqual(
        `https://testnet.hedera.com/api/v1/topics/0.0.123/messages?limit=25&encoding=base64`,
      );
    });

    it('should update the limit parameter', () => {
      const topicReader = new TopicReaderHederaRestApi();
      const network: Network = 'testnet';
      const apiUrl = TopicReaderHederaRestApi['DEFAULT_NETWORK_MAP'][network];
      const nextPath = `/api/v1/topics/0.0.123/messages`;
      const limit = 50;

      const result = topicReader['getNextUrl'](network, nextPath, limit);
      expect(result).toEqual(
        `${apiUrl}${nextPath}?limit=${limit}&encoding=base64`,
      );
    });

    it('should update the encoding parameter', () => {
      const topicReader = new TopicReaderHederaRestApi();
      const network: Network = 'testnet';
      const apiUrl = TopicReaderHederaRestApi['DEFAULT_NETWORK_MAP'][network];
      const nextPath = `/api/v1/topics/0.0.123/messages`;
      const encoding = 'hex';

      const result = topicReader['getNextUrl'](network, nextPath, 25, encoding);
      expect(result).toEqual(
        `${apiUrl}${nextPath}?limit=25&encoding=${encoding}`,
      );
    });

    it('should set the default limit to 25', () => {
      const topicReader = new TopicReaderHederaRestApi();
      const network: Network = 'testnet';
      const nextPath = `/api/v1/topics/0.0.123/messages`;
      const apiUrl = TopicReaderHederaRestApi['DEFAULT_NETWORK_MAP'][network];

      const result = topicReader['getNextUrl'](network, nextPath);
      expect(result).toEqual(`${apiUrl}${nextPath}?limit=25&encoding=base64`);
    });

    it('should set the default encoding to base64', () => {
      const topicReader = new TopicReaderHederaRestApi();
      const network: Network = 'testnet';
      const nextPath = `/api/v1/topics/0.0.123/messages`;
      const apiUrl = TopicReaderHederaRestApi['DEFAULT_NETWORK_MAP'][network];

      const result = topicReader['getNextUrl'](network, nextPath);
      expect(result).toEqual(`${apiUrl}${nextPath}?limit=25&encoding=base64`);
    });

    it('should pass parameters from the nextPath to the URL', () => {
      const topicReader = new TopicReaderHederaRestApi();
      const network: Network = 'testnet';
      const apiUrl = TopicReaderHederaRestApi['DEFAULT_NETWORK_MAP'][network];
      const nextPath = `/api/v1/topics/0.0.123/messages?someParam=someValue`;

      const result = topicReader['getNextUrl'](network, nextPath);
      expect(result).toEqual(`${apiUrl}${nextPath}&limit=25&encoding=base64`);
    });
  });

  describe('fetchMessages()', () => {
    it('should fetch messages from the given URL', async () => {
      const topicReader = new TopicReaderHederaRestApi();
      const url = 'https://testnet.hedera.com/api/v1/topics/0.0.123/messages';

      mockResponse([
        {
          messages: ['test message 1', 'test message 2'],
          links: { next: null },
        },
      ]);

      const result = await topicReader['fetchMessages'](url);
      expect(result).toEqual({
        messages: ['test message 1', 'test message 2'],
        nextPath: null,
      });
      expect(fetch).toHaveBeenCalledTimes(1);
      expect(fetch).toHaveBeenCalledWith(url, {
        method: 'GET',
        headers: {
          Accept: 'application/json',
        },
      });
    });

    it('should throw an error if the response is not ok', async () => {
      const topicReader = new TopicReaderHederaRestApi();
      const url = 'https://testnet.hedera.com/api/v1/topics/0.0.123/messages';

      global.fetch = jest.fn().mockResolvedValueOnce({
        ok: false,
        statusText: 'Not Found',
      });

      await expect(topicReader['fetchMessages'](url)).rejects.toThrow(
        'Failed to fetch topic messages: Not Found',
      );
      expect(fetch).toHaveBeenCalledTimes(1);
    });

    it('should throw an error if the response is not JSON', async () => {
      const topicReader = new TopicReaderHederaRestApi();
      const url = 'https://testnet.hedera.com/api/v1/topics/0.0.123/messages';

      global.fetch = jest.fn().mockResolvedValueOnce({
        ok: true,
        json: jest.fn().mockRejectedValue(new Error('Not JSON')),
      });

      await expect(topicReader['fetchMessages'](url)).rejects.toThrow(
        'Not JSON',
      );
    });

    it('should pass the next path parameter', async () => {
      const topicReader = new TopicReaderHederaRestApi();
      const url = 'https://testnet.hedera.com/api/v1/topics/0.0.123/messages';
      const nextPath = '/api/v1/topics/0.0.123/messages?someParam=someValue';

      mockResponse([
        {
          messages: ['test message 1', 'test message 2'],
          links: { next: nextPath },
        },
      ]);

      const result = await topicReader['fetchMessages'](url);
      expect(result).toEqual({
        messages: ['test message 1', 'test message 2'],
        nextPath,
      });
    });
  });
});
