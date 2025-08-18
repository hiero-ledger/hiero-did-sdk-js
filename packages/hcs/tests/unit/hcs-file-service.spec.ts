import { HcsFileService, ChunkMessage } from '../../src';
import { Client, PrivateKey } from '@hashgraph/sdk';
import { Crypto } from '@hiero-did-sdk/crypto';
import { Zstd } from '@hiero-did-sdk/zstd';
import { Buffer } from 'buffer';

const mockTopicId = 'mockTopicId';

const mockHash = '9f86d081884c7d659a2feaa0c55ad015a3bf4f1b2b0b822cd15d6c15b0f00a08';
const mockHcsTopicMemo = `${mockHash}:zstd:base64`;

const testPayload = Buffer.from('test payload');

// Mock dependencies
jest.mock('@hiero-did-sdk/crypto', () => ({
  Crypto: {
    // TODO: Update mocks to properly re-use const value
    sha256: jest.fn().mockReturnValue('9f86d081884c7d659a2feaa0c55ad015a3bf4f1b2b0b822cd15d6c15b0f00a08'),
  },
}));

jest.mock('@hiero-did-sdk/zstd', () => ({
  Zstd: {
    compress: jest.fn((data: Buffer) => Buffer.from(`compressed-${data.toString()}`)),
    decompress: jest.fn((data: Buffer) => Buffer.from(data.toString().replace('compressed-', ''))),
  },
}));

// Mock HcsMessageService, HcsTopicService and HcsCacheService
const mockSubmitMessage = jest.fn().mockResolvedValue(undefined);
const mockGetTopicMessages = jest.fn().mockResolvedValue([]);

const mockCreateTopic = jest.fn().mockResolvedValue(mockTopicId);
const mockGetTopicInfo = jest.fn().mockResolvedValue({
  topicId: mockTopicId,
  topicMemo: mockHcsTopicMemo,
});

const mockSetTopicFile = jest.fn();
const mockGetTopicFile = jest.fn().mockResolvedValue(undefined);

jest.mock('../../src/hcs/hcs-message-service', () => {
  return {
    HcsMessageService: jest.fn().mockImplementation(() => ({
      submitMessage: mockSubmitMessage,
      getTopicMessages: mockGetTopicMessages,
    })),
  };
});

jest.mock('../../src/hcs/hcs-topic-service', () => {
  return {
    HcsTopicService: jest.fn().mockImplementation(() => ({
      createTopic: mockCreateTopic,
      getTopicInfo: mockGetTopicInfo,
    })),
  };
});

jest.mock('../../src/cache/hcs-cache-service', () => {
  return {
    HcsCacheService: jest.fn().mockImplementation(() => ({
      getTopicFile: mockGetTopicFile,
      setTopicFile: mockSetTopicFile,
    })),
  };
});

describe('HcsFileService', () => {
  const mockClient = {} as Client;
  const mockPrivateKey = {} as PrivateKey;

  let service: HcsFileService;

  beforeEach(() => {
    jest.clearAllMocks();
    service = new HcsFileService(mockClient, { maxSize: 10 });
  });

  describe('constructor', () => {
    it('should initialize without cache', () => {
      const serviceWithoutCache = new HcsFileService(mockClient);
      expect(serviceWithoutCache).toBeDefined();
    });

    it('should initialize with cache', () => {
      const serviceWithCache = new HcsFileService(mockClient, { maxSize: 10 });
      expect(serviceWithCache).toBeDefined();
    });
  });

  describe('submitFile', () => {
    it('should submit a file successfully', async () => {
      const submitKey = PrivateKey.generate();
      const result = await service.submitFile({ payload: testPayload, submitKey});

      expect(Crypto.sha256).toHaveBeenCalledWith(testPayload);
      expect(Zstd.compress).toHaveBeenCalledWith(testPayload);

      expect(mockCreateTopic).toHaveBeenCalledWith({
        topicMemo: mockHcsTopicMemo,
        submitKey,
      });

      expect(mockSubmitMessage).toHaveBeenCalled();
      expect(result).toBe(mockTopicId);
    });

    it('should submit a file with submitKey', async () => {
      await service.submitFile({
        payload: testPayload,
        submitKey: mockPrivateKey,
      });

      expect(mockCreateTopic).toHaveBeenCalledWith({
        topicMemo: mockHcsTopicMemo,
        submitKey: mockPrivateKey,
      });
    });

    it('should wait for changes visibility if specified', async () => {
      // Mock implementation for waitForChangesVisibility
      jest.spyOn(global, 'setTimeout').mockImplementation((callback: TimerHandler) => {
        if (typeof callback === 'function') {
          // eslint-disable-next-line @typescript-eslint/no-unsafe-call
          callback();
        }
        return {} as NodeJS.Timeout;
      });

      await service.submitFile({
        payload: testPayload,
        submitKey: PrivateKey.generate(),
        waitForChangesVisibility: true,
        waitForChangesVisibilityTimeoutMs: 1000,
      });

      // The test passes if no error is thrown
      expect(true).toBeTruthy();
    });
  });

  describe('resolveFile', () => {
    it('should return cached file if available', async () => {
      const cachedFile = Buffer.from('cached file');

      mockGetTopicFile.mockResolvedValueOnce(cachedFile);

      const result = await service.resolveFile({ topicId: mockTopicId });

      expect(mockGetTopicFile).toHaveBeenCalledWith(mockClient, mockTopicId);
      expect(result).toBe(cachedFile);
    });

    it('should resolve file from HCS when not cached', async () => {
      mockGetTopicFile.mockResolvedValueOnce(null);

      // Mock message service to return chunks
      mockGetTopicMessages.mockResolvedValueOnce([
        {
          contents: Buffer.from(
            JSON.stringify({ o: 0, c: 'data:application/json;base64,Y29tcHJlc3NlZC10ZXN0IHBheWxvYWQ=' })
          ),
        },
      ]);

      // Mock Crypto.sha256 for validation
      (Crypto.sha256 as jest.Mock).mockReturnValueOnce(mockHash);

      const result = await service.resolveFile({ topicId: mockTopicId });

      expect(mockSetTopicFile).toHaveBeenCalledWith(mockClient, mockTopicId, testPayload);

      expect(mockGetTopicInfo).toHaveBeenCalledWith({ topicId: mockTopicId });
      expect(mockGetTopicMessages).toHaveBeenCalledWith({ topicId: mockTopicId });

      expect(mockSetTopicFile).toHaveBeenCalledWith(mockClient, mockTopicId, result);

      // The result should be the decompressed payload
      expect(result.toString()).toBe('test payload');
    });

    it('should throw error if topic memo is invalid', async () => {
      mockGetTopicFile.mockResolvedValueOnce(null);

      mockGetTopicInfo.mockResolvedValueOnce({
        topicId: mockTopicId,
        topicMemo: 'invalidMemo',
      });

      await expect(service.resolveFile({ topicId: mockTopicId })).rejects.toThrow(
        `HCS file Topic ${mockTopicId} is invalid - must contain memo compliant with HCS-1 standard`
      );
    });

    it('should throw error if topic has adminKey', async () => {
      mockGetTopicFile.mockResolvedValueOnce(null);

      mockGetTopicInfo.mockResolvedValueOnce({
        topicId: mockTopicId,
        topicMemo: mockHcsTopicMemo,
        adminKey: 'someKey',
      });

      await expect(service.resolveFile({ topicId: mockTopicId })).rejects.toThrow(
        `HCS file topic ${mockTopicId} contains adminKey`
      );
    });

    it('should throw error if resolved payload checksum is invalid', async () => {
      mockGetTopicFile.mockResolvedValueOnce(null);

      mockGetTopicMessages.mockResolvedValueOnce([
        {
          contents: Buffer.from(
            JSON.stringify({ o: 0, c: 'data:application/json;base64,Y29tcHJlc3NlZC10ZXN0IHBheWxvYWQ=' })
          ),
        },
      ]);

      // Mock Crypto.sha256 to return a different hash for validation
      (Crypto.sha256 as jest.Mock).mockReturnValueOnce('differentHash');

      await expect(service.resolveFile({ topicId: mockTopicId })).rejects.toThrow(
        'Resolved HCS file payload is invalid'
      );
    });
  });

  describe('buildFileFromChunkMessages', () => {
    it('should build file from chunk messages in correct order', () => {
      // Create a private method accessor using type assertion
      type PrivateHcsFileService = {
        buildFileFromChunkMessages(chunkMessages: ChunkMessage[]): Buffer;
      };
      const buildFileFromChunkMessages = (service as unknown as PrivateHcsFileService).buildFileFromChunkMessages.bind(
        service
      );

      const chunkMessages: ChunkMessage[] = [
        { o: 1, c: 'second' },
        { o: 0, c: 'data:application/json;base64,' },
        { o: 2, c: 'third' },
      ];

      // Mock Zstd.decompress for this test

      (Zstd.decompress as jest.Mock).mockReturnValueOnce('decompressed content');

      // eslint-disable-next-line @typescript-eslint/no-unsafe-call
      const result = buildFileFromChunkMessages(chunkMessages);

      // eslint-disable-next-line @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access
      expect(result.toString()).toBe('decompressed content');
    });

    it('should throw error if building file fails', () => {
      // Create a private method accessor using type assertion
      type PrivateHcsFileService = {
        buildFileFromChunkMessages(chunkMessages: ChunkMessage[]): Buffer;
      };
      const buildFileFromChunkMessages = (service as unknown as PrivateHcsFileService).buildFileFromChunkMessages.bind(
        service
      );

      // Mock Zstd.decompress to throw an error

      (Zstd.decompress as jest.Mock).mockImplementationOnce(() => {
        throw new Error('Decompression failed');
      });

      // eslint-disable-next-line @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-return
      expect(() => buildFileFromChunkMessages([{ o: 0, c: 'data:application/json;base64,invalid' }])).toThrow(
        'Error on building HCS-1 file payload from chunk messages: Decompression failed'
      );
    });
  });

  describe('buildChunkMessagesFromFile', () => {
    it('should split large payload into chunks', () => {
      // Create a private method accessor using type assertion
      type PrivateHcsFileService = {
        buildChunkMessagesFromFile(payload: Buffer): Array<{ orderIndex: number; content: string }>;
      };
      const buildChunkMessagesFromFile = (service as unknown as PrivateHcsFileService).buildChunkMessagesFromFile.bind(
        service
      );

      // Create a large payload that will be split into multiple chunks
      const largePayload = Buffer.from('a'.repeat(2000));

      // eslint-disable-next-line @typescript-eslint/no-unsafe-call
      const result = buildChunkMessagesFromFile(largePayload);

      // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
      expect(result.length).toBeGreaterThan(1);
      // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
      expect(result[0].orderIndex).toBe(0);
      // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
      expect(result[1].orderIndex).toBe(1);
    });

    it('should throw error if building chunks fails', () => {
      // Create a private method accessor using type assertion
      type PrivateHcsFileService = {
        buildChunkMessagesFromFile(payload: Buffer): Array<{ orderIndex: number; content: string }>;
      };
      const buildChunkMessagesFromFile = (service as unknown as PrivateHcsFileService).buildChunkMessagesFromFile.bind(
        service
      );

      // Mock Zstd.compress to throw an error

      (Zstd.compress as jest.Mock).mockImplementationOnce(() => {
        throw new Error('Compression failed');
      });

      // eslint-disable-next-line @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-return
      expect(() => buildChunkMessagesFromFile(testPayload)).toThrow(
        'Error on getting chunk messages for HCS-1 file: Error: Compression failed'
      );
    });
  });

  describe('createHCS1Memo', () => {
    it('should create a valid HCS-1 memo', () => {
      // Create a private method accessor using type assertion
      type PrivateHcsFileService = {
        createHCS1Memo(hash: string): string;
      };
      const createHCS1Memo = (service as unknown as PrivateHcsFileService).createHCS1Memo.bind(service);

      // eslint-disable-next-line @typescript-eslint/no-unsafe-call
      const result = createHCS1Memo('testHash');
      expect(result).toBe('testHash:zstd:base64');
    });
  });

  describe('isValidHCS1Memo', () => {
    it('should validate a correct HCS-1 memo', () => {
      // Create a private method accessor using type assertion
      type PrivateHcsFileService = {
        isValidHCS1Memo(memo: string): boolean;
      };
      const isValidHCS1Memo = (service as unknown as PrivateHcsFileService).isValidHCS1Memo.bind(service);

      const validMemo = '1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef:zstd:base64';
      // eslint-disable-next-line @typescript-eslint/no-unsafe-call
      expect(isValidHCS1Memo(validMemo)).toBe(true);
    });

    it('should reject an invalid HCS-1 memo', () => {
      // Create a private method accessor using type assertion
      type PrivateHcsFileService = {
        isValidHCS1Memo(memo: string): boolean;
      };
      const isValidHCS1Memo = (service as unknown as PrivateHcsFileService).isValidHCS1Memo.bind(service);

      const invalidMemos = [
        '',
        'invalid',
        '123:zstd:base64', // Too short hash
        'abcdefg:wrong:base64',
        'abcdefg:zstd:wrong',
      ];

      invalidMemos.forEach((memo) => {
        // eslint-disable-next-line @typescript-eslint/no-unsafe-call
        expect(isValidHCS1Memo(memo)).toBe(false);
      });
    });
  });

  describe('isValidHCS1Checksum', () => {
    it('should validate matching checksums', () => {
      // Create a private method accessor using type assertion
      type PrivateHcsFileService = {
        isValidHCS1Checksum(memo: string, checksum: string): boolean;
      };
      const isValidHCS1Checksum = (service as unknown as PrivateHcsFileService).isValidHCS1Checksum.bind(service);

      const memo = 'checksum123:zstd:base64';
      const checksum = 'checksum123';

      // eslint-disable-next-line @typescript-eslint/no-unsafe-call
      expect(isValidHCS1Checksum(memo, checksum)).toBe(true);
    });

    it('should reject non-matching checksums', () => {
      // Create a private method accessor using type assertion
      type PrivateHcsFileService = {
        isValidHCS1Checksum(memo: string, checksum: string): boolean;
      };
      const isValidHCS1Checksum = (service as unknown as PrivateHcsFileService).isValidHCS1Checksum.bind(service);

      const memo = 'checksum123:zstd:base64';
      const checksum = 'differentChecksum';

      // eslint-disable-next-line @typescript-eslint/no-unsafe-call
      expect(isValidHCS1Checksum(memo, checksum)).toBe(false);
    });

    it('should throw error if memo is empty', () => {
      // Create a private method accessor using type assertion
      type PrivateHcsFileService = {
        isValidHCS1Checksum(memo: string, checksum: string): boolean;
      };
      const isValidHCS1Checksum = (service as unknown as PrivateHcsFileService).isValidHCS1Checksum.bind(service);

      // eslint-disable-next-line @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-return
      expect(() => isValidHCS1Checksum('', 'checksum')).toThrow('Memo is required');
    });
  });
});
