/* eslint-disable @typescript-eslint/no-explicit-any */
import { HederaHcsService } from '@hiero-did-sdk/hcs';
import { Zstd } from '@hiero-did-sdk/zstd';
import { Buffer } from 'buffer';
import { HederaAnoncredsRegistry, HederaAnoncredsRegistryConfiguration } from '../../src';
import { buildAnonCredsIdentifier, parseAnonCredsIdentifier } from '../../src/utils';
import {
  AnonCredsCredentialDefinition,
  AnonCredsRevocationRegistryDefinition, AnonCredsRevocationStatusList,
  AnonCredsSchema,
} from '../../src/specification';
import {
  AnonCredsRevocationStatusListWithoutTimestamp, RegisterCredentialDefinitionOptions,
  RegisterCredentialDefinitionReturnStateFailed,
  RegisterRevocationRegistryDefinitionReturnStateFailed,
  RegisterRevocationStatusListReturnStateFailed,
  RegisterSchemaReturnStateFailed,
  RevocationRegistryEntryMessage,
} from '../../src/dto';
import { NetworkName } from '@hiero-did-sdk/client';

jest.mock('@hiero-did-sdk/hcs');
jest.mock('@hiero-did-sdk/zstd');
jest.mock('../../src/utils');

describe('HederaAnoncredsRegistry', () => {
  let serviceMock: jest.Mocked<HederaHcsService>;
  let registry: HederaAnoncredsRegistry;

  beforeEach(() => {
    serviceMock = {
      submitFile: jest.fn(),
      resolveFile: jest.fn(),
      createTopic: jest.fn(),
      submitMessage: jest.fn(),
      getTopicMessages: jest.fn(),
    } as any;

    (HederaHcsService as jest.Mock).mockImplementation(() => serviceMock);

    (buildAnonCredsIdentifier as jest.Mock).mockImplementation(
      (issuerId: string, topicId: string, type: string) => `${issuerId}|${topicId}|${type}`
    );
    (parseAnonCredsIdentifier as jest.Mock).mockImplementation((id: string) => {
      const parts = id.split('|');
      return { topicId: parts[1] || 'topicId', networkName: 'testnet' };
    });

    (Zstd.compress as jest.Mock).mockImplementation((buf: Buffer) => buf);
    (Zstd.decompress as jest.Mock).mockImplementation((buf: Buffer) => buf);

    registry = new HederaAnoncredsRegistry({} as HederaAnoncredsRegistryConfiguration);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('registerSchema', () => {
    it('should register schema successfully', async () => {
      serviceMock.submitFile.mockResolvedValue('topic-id-123');

      const schema: AnonCredsSchema = {
        issuerId: 'issuer1',
        name: 'schema1',
        version: '1.0',
        attrNames: [],
      };
      const result = await registry.registerSchema({ schema, networkName: 'testnet', options: {} });

      expect(result.schemaState.state).toBe('finished');
      expect(result.schemaState.schema).toEqual(schema);
      expect(serviceMock.submitFile).toHaveBeenCalled();
    });

    it('should handle error when registering schema', async () => {
      serviceMock.submitFile.mockRejectedValue(new Error('fail'));

      const schema: AnonCredsSchema = {
        issuerId: 'issuer1',
        name: 'schema1',
        version: '1.0',
        attrNames: [],
      };
      const result = await registry.registerSchema({ schema, networkName: 'testnet', options: {} });

      expect(result.schemaState.state).toBe('failed');
      const failedState = result.schemaState as RegisterSchemaReturnStateFailed;
      expect(failedState.reason).toBe('fail');
    });
  });

  describe('getSchema', () => {
    it('should get schema from registry', async () => {
      const schemaObj = { data: 'schema-data' };
      serviceMock.resolveFile.mockResolvedValue(Buffer.from(JSON.stringify(schemaObj)));

      const id = 'issuer|topicId|SCHEMA';
      const result = await registry.getSchema(id);

      expect(result.schemaId).toBe(id);
      expect(result.schema).toEqual(schemaObj);
      expect(serviceMock.resolveFile).toHaveBeenCalled();
    });
  });

  describe('registerCredentialDefinition', () => {
    it('registerCredentialDefinition - success', async () => {
      serviceMock.submitFile.mockResolvedValue('cred-def-topic');

      const credentialDefinition: AnonCredsCredentialDefinition = {
        issuerId: 'issuer2',
        schemaId: '',
        type: 'CL',
        tag: '',
        value: {
          primary: undefined,
          revocation: undefined,
        },
      };
      const options = { credentialDefinition, networkName: 'testnet', options: { optionKey: 'optionVal' } };

      const result = await registry.registerCredentialDefinition(options);

      expect(result.credentialDefinitionState.state).toBe('finished');
      expect(result.credentialDefinitionState.credentialDefinition).toEqual(credentialDefinition);

      expect(result.credentialDefinitionMetadata).toEqual(options.options);
    });

    it('registerCredentialDefinition - failure', async () => {
      serviceMock.submitFile.mockRejectedValue('fail');

      const credentialDefinition: AnonCredsCredentialDefinition = {
        issuerId: 'issuer2',
        schemaId: '',
        type: 'CL',
        tag: '',
        value: {
          primary: undefined,
          revocation: undefined,
        },
      };
      const options: RegisterCredentialDefinitionOptions & NetworkName = {
        credentialDefinition,
        networkName: 'testnet',
        options: {},
      };

      const result = await registry.registerCredentialDefinition(options);

      expect(result.credentialDefinitionState.state).toBe('failed');
      const failedState = result.credentialDefinitionState as RegisterCredentialDefinitionReturnStateFailed;
      expect(failedState.reason).toMatch(/fail/);
    });
  });

  describe('getCredentialDefinition', () => {
    it('should get credential definition from registry', async () => {
      const credentialDefinition = { data: 'credDef' };
      serviceMock.resolveFile.mockResolvedValue(Buffer.from(JSON.stringify(credentialDefinition)));

      const id = 'issuer|credDefTopic|PUBLIC_CRED_DEF';
      const result = await registry.getCredentialDefinition(id);

      expect(result.credentialDefinitionId).toBe(id);
      expect(result.credentialDefinition).toEqual(credentialDefinition);
    });
  });

  describe('registerRevocationRegistryDefinition', () => {
    it('register revocation registry definition successfully', async () => {
      serviceMock.createTopic.mockResolvedValue('entries-topic-id');
      serviceMock.submitFile.mockResolvedValue('rev-reg-topic-id');

      const revocationRegistryDefinition: AnonCredsRevocationRegistryDefinition = {
        issuerId: 'issuer3',
        value: {
          maxCredNum: 5,
          publicKeys: {
            accumKey: {
              z: '',
            },
          },
          tailsLocation: '',
          tailsHash: '',
        },
        revocDefType: 'CL_ACCUM',
        credDefId: '',
        tag: '',
      };

      const result = await registry.registerRevocationRegistryDefinition({
        revocationRegistryDefinition,
        networkName: 'testnet',
        options: {},
      });

      expect(result.revocationRegistryDefinitionState.state).toBe('finished');
      expect(result.revocationRegistryDefinitionMetadata.entriesTopicId).toBe('entries-topic-id');
      expect(result.revocationRegistryDefinitionState.revocationRegistryDefinition).toEqual(
        revocationRegistryDefinition
      );
    });

    it('register revocation registry definition failure', async () => {
      serviceMock.createTopic.mockRejectedValue(new Error('fail'));

      const revocationRegistryDefinition: AnonCredsRevocationRegistryDefinition = {
        issuerId: 'issuer3',
        value: {
          maxCredNum: 5,
          publicKeys: {
            accumKey: {
              z: '',
            },
          },
          tailsLocation: '',
          tailsHash: '',
        },
        revocDefType: 'CL_ACCUM',
        credDefId: '',
        tag: '',
      };

      const result = await registry.registerRevocationRegistryDefinition({
        revocationRegistryDefinition,
        networkName: 'testnet',
        options: {},
      });

      expect(result.revocationRegistryDefinitionState.state).toBe('failed');
      const failedState =
        result.revocationRegistryDefinitionState as RegisterRevocationRegistryDefinitionReturnStateFailed;
      expect(failedState.reason).toContain('fail');
    });
  });

  describe('getRevocationRegistryDefinition', () => {
    it('should get revocation registry definition successfully', async () => {
      const payload = {
        revRegDef: { issuerId: 'issuer3', value: { maxCredNum: 5 } },
        hcsMetadata: { entriesTopicId: 'entries-topic' },
      };
      serviceMock.resolveFile.mockResolvedValue(Buffer.from(JSON.stringify(payload)));

      const id = 'issuer3|topicId|REV_REG';

      const result = await registry.getRevocationRegistryDefinition(id);

      expect(result.revocationRegistryDefinition).toEqual(payload.revRegDef);
      expect(result.revocationRegistryDefinitionMetadata).toEqual(payload.hcsMetadata);
      expect(result.resolutionMetadata).toEqual({});
    });

    it('should catch error and return failure metadata', async () => {
      serviceMock.resolveFile.mockRejectedValue(new Error('fail'));

      const id = 'issuer3|topicId|REV_REG';

      const result = await registry.getRevocationRegistryDefinition(id);

      expect(result.resolutionMetadata.error).toBe('invalid');
      expect(result.resolutionMetadata.message).toContain('fail');
    });
  });

  describe('registerRevocationStatusList', () => {
    it('should register revocation status list successfully', async () => {
      const revRegDefId = 'issuer3|topicId|REV_REG';

      jest.spyOn(registry as any, 'resolveRevocationStatusList').mockResolvedValue({
        entriesTopicId: 'entries-topic-id',
        statusList: {
          currentAccumulator: 'accum1',
          revocationList: [0, 0, 1],
        },
      });

      serviceMock.submitMessage.mockResolvedValue(undefined);

      const revocationStatusList: AnonCredsRevocationStatusListWithoutTimestamp = {
        revRegDefId,
        revocationList: [0, 1, 1],
        currentAccumulator: 'accum2',
        issuerId: '',
      };

      const result = await registry.registerRevocationStatusList({
        revocationStatusList,
        networkName: 'testnet',
        options: {},
      });

      expect(result.revocationStatusListState.state).toBe('finished');
      expect(serviceMock.submitMessage).toBeCalledWith(expect.objectContaining({ topicId: 'entries-topic-id' }));
    });

    it('should handle failure on registerRevocationStatusList', async () => {
      jest.spyOn(registry as any, 'resolveRevocationStatusList').mockRejectedValue(new Error('fail'));

      const revocationStatusList: AnonCredsRevocationStatusListWithoutTimestamp = {
        revRegDefId: 'id',
        revocationList: [0, 1],
        currentAccumulator: 'accum',
        issuerId: '',
      };

      const result = await registry.registerRevocationStatusList({
        revocationStatusList,
        networkName: 'testnet',
        options: {},
      });

      expect(result.revocationStatusListState.state).toBe('failed');
      const failedState = result.revocationStatusListState as RegisterRevocationStatusListReturnStateFailed;
      expect(failedState.reason).toContain('fail');
    });
  });

  describe('getRevocationStatusList', () => {
    it('should get revocation status list successfully', async () => {
      const statusList = {
        revocationList: [0, 1],
        issuerId: 'issuer',
        revRegDefId: 'id',
        timestamp: 123,
        currentAccumulator: 'accum',
      };
      jest
        .spyOn(registry as any, 'resolveRevocationStatusList')
        .mockResolvedValue({ entriesTopicId: 'topic', statusList });

      const result = await registry.getRevocationStatusList('id', 123);

      expect(result.revocationStatusList).toEqual(statusList);
      expect(result.resolutionMetadata).toEqual({});
    });

    it('should return error if statusList is undefined', async () => {
      jest
        .spyOn(registry as any, 'resolveRevocationStatusList')
        .mockResolvedValue({ entriesTopicId: 'topic', statusList: undefined });

      const result = await registry.getRevocationStatusList('id', 123);

      expect(result.revocationStatusList).toBeUndefined();
      expect(result.resolutionMetadata.error).toBe('notFound');
    });

    it('should handle rejection', async () => {
      jest.spyOn(registry as any, 'resolveRevocationStatusList').mockRejectedValue(new Error('fail'));

      const result = await registry.getRevocationStatusList('id', 123);

      expect(result.revocationStatusList).toBeUndefined();
      expect(result.resolutionMetadata.error).toBe('invalid');
      expect(result.resolutionMetadata.message).toContain('fail');
    });
  });

  describe('getStatusListDiff', () => {
    it('should return correct diffs', () => {
      const original = [0, 1, 0, 1];
      const modified = [1, 0, 0, 1];

      // eslint-disable-next-line @typescript-eslint/no-unsafe-call,@typescript-eslint/no-unsafe-member-access
      const result: { issued: number[]; revoked: number[] } = (registry as any).getStatusListDiff(original, modified);

      expect(result.issued).toEqual([1]);
      expect(result.revoked).toEqual([0]);
    });

    it('should throw if array lengths differ', () => {
      // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access,@typescript-eslint/no-unsafe-call,@typescript-eslint/no-unsafe-return
      expect(() => (registry as any).getStatusListDiff([0], [0, 1])).toThrow();
    });

    it('should throw if status lists have invalid values', () => {
      // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access,@typescript-eslint/no-unsafe-call,@typescript-eslint/no-unsafe-return
      expect(() => (registry as any).getStatusListDiff([2], [0])).toThrow();
      // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access,@typescript-eslint/no-unsafe-call,@typescript-eslint/no-unsafe-return
      expect(() => (registry as any).getStatusListDiff([0], [3])).toThrow();
    });
  });

  describe('packRevocationRegistryEntryMessage', () => {
    it('should compress and pack message', () => {
      (Zstd.compress as jest.Mock).mockImplementation(() => Buffer.from('compressed'));
      const messageData = { value: { accum: 'accum1' } };
      // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access,@typescript-eslint/no-unsafe-call
      const result = (registry as any).packRevocationRegistryEntryMessage(messageData);

      expect(typeof result).toBe('string');
      expect(result).toContain('payload');
    });
  });

  describe('extractRevocationRegistryEntryMessage', () => {
    it('should extract and decompress message', () => {
      const inner = JSON.stringify({ value: { accum: 'accum1' } });
      (Zstd.decompress as jest.Mock).mockImplementation(() => Buffer.from(inner));
      const wrapper = { payload: Buffer.from(inner).toString('base64') };

      const data = Buffer.from(JSON.stringify(wrapper));
      // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access,@typescript-eslint/no-unsafe-call
      const result = (registry as any).extractRevocationRegistryEntryMessage(data);

      expect(result).toHaveProperty('value.accum', 'accum1');
    });

    it('should return undefined on invalid data', () => {
      const data = Buffer.from('invalid');
      // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access,@typescript-eslint/no-unsafe-call
      const result = (registry as any).extractRevocationRegistryEntryMessage(data);
      expect(result).toBeUndefined();
    });
  });

  describe('verifyRevocationRegistryEntryMessage', () => {
    it('should return true if accum exists', () => {
      const data = { value: { accum: 'accum' } };
      // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access,@typescript-eslint/no-unsafe-call
      expect((registry as any).verifyRevocationRegistryEntryMessage(data)).toBe(true);
    });

    it('should return false if accum missing', () => {
      // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access,@typescript-eslint/no-unsafe-call
      expect((registry as any).verifyRevocationRegistryEntryMessage({ value: {} })).toBe(false);
    });
  });

  describe('private resolveRevocationRegistryDefinition - failure ', () => {
    it('should throw AnonCredsResolutionMetadataError if payloadBuffer is falsy', async () => {
      serviceMock.resolveFile.mockResolvedValue(null);

      // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access,@typescript-eslint/no-unsafe-call
      await expect((registry as any).resolveRevocationRegistryDefinition('issuer|topic|REV_REG')).rejects.toThrowError(
        'AnonCreds revocation registry with id issuer|topic|REV_REG not found'
      );

      expect(serviceMock.resolveFile).toHaveBeenCalled();
    });
  });

  describe('private resolveRevocationStatusList - empty messages', () => {
    it('should return undefined statusList if no messages found even after limit 1', async () => {
      jest.spyOn(registry, 'getRevocationRegistryDefinition').mockResolvedValue({
        revocationRegistryDefinition: {
          issuerId: 'issuer3',
          value: {
            maxCredNum: 5,
            publicKeys: {
              accumKey: {
                z: '',
              },
            },
            tailsLocation: '',
            tailsHash: '',
          },
          revocDefType: 'CL_ACCUM',
          credDefId: '',
          tag: '',
        },
        revocationRegistryDefinitionMetadata: { entriesTopicId: 'entries-topic' },
        resolutionMetadata: {},
        revocationRegistryDefinitionId: 'id',
      });

      serviceMock.getTopicMessages.mockResolvedValueOnce([]).mockResolvedValueOnce([]);

      const result: {
        entriesTopicId: string;
        statusList?: AnonCredsRevocationStatusList;
        // eslint-disable-next-line @typescript-eslint/no-unsafe-call,@typescript-eslint/no-unsafe-member-access
      } = await (registry as any).resolveRevocationStatusList('id', 1000);

      expect(result.entriesTopicId).toBe('entries-topic');
      expect(result.statusList).toBeUndefined();
    });
  });

  describe('private resolveRevocationStatusList - messages filtered by verify and parsing', () => {
    it('should filter out messages with invalid or unverifiable entries', async () => {
      jest.spyOn(registry, 'getRevocationRegistryDefinition').mockResolvedValue({
        revocationRegistryDefinition: {
          issuerId: 'issuerId',
          value: {
            maxCredNum: 2,
            publicKeys: {
              accumKey: {
                z: '',
              },
            },
            tailsLocation: '',
            tailsHash: '',
          },
          revocDefType: 'CL_ACCUM',
          credDefId: '',
          tag: '',
        },
        revocationRegistryDefinitionMetadata: { entriesTopicId: 'topicId' },
        resolutionMetadata: {},
        revocationRegistryDefinitionId: 'id',
      });

      const badContents = Buffer.from('bad data');

      const extractMock = jest.spyOn(registry as any, 'extractRevocationRegistryEntryMessage');
      extractMock.mockImplementation((data: Uint8Array) => {
        const str = data.toString();
        if (str === badContents.toString()) return undefined;
        return { value: { accum: 'accum', issued: [0], revoked: [] } };
      });

      const verifyMock = jest.spyOn(registry as any, 'verifyRevocationRegistryEntryMessage');
      verifyMock.mockImplementation((data: RevocationRegistryEntryMessage) => !!data.value?.accum);

      serviceMock.getTopicMessages.mockResolvedValue([
        {
          contents: badContents,
          consensusTime: undefined,
        },
        {
          contents: Buffer.from('good data'),
          consensusTime: undefined,
        },
      ]);

      const result: {
        entriesTopicId: string;
        statusList?: AnonCredsRevocationStatusList;
        // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access,@typescript-eslint/no-unsafe-call
      } = await (registry as any).resolveRevocationStatusList('id', 1000);

      expect(result.statusList).toBeDefined();
      expect(result.statusList?.revocationList.length).toBe(2);
      expect(result.entriesTopicId).toBe('topicId');

      expect(extractMock).toHaveBeenCalled();
      expect(verifyMock).toHaveBeenCalled();
    });
  });

  describe('resolveRevocationStatusList error branches', () => {
    it('should throw error when revocationRegistryDefinition is missing', async () => {
      jest.spyOn(registry, 'getRevocationRegistryDefinition').mockResolvedValue({
        revocationRegistryDefinition: undefined,
        revocationRegistryDefinitionMetadata: {},
        resolutionMetadata: {},
        revocationRegistryDefinitionId: 'id',
      });

      // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access,@typescript-eslint/no-unsafe-call
      await expect((registry as any).resolveRevocationStatusList('id', 123))
        .rejects.toThrowError(/not found/i);
    });

    it('should throw error when entriesTopicId is missing', async () => {
      jest.spyOn(registry, 'getRevocationRegistryDefinition').mockResolvedValue({
        revocationRegistryDefinition: {
          issuerId: 'issuer3',
          value: {
            maxCredNum: 5,
            publicKeys: {
              accumKey: {
                z: '',
              },
            },
            tailsLocation: '',
            tailsHash: '',
          },
          revocDefType: 'CL_ACCUM',
          credDefId: '',
          tag: '',
        },
        revocationRegistryDefinitionMetadata: {},
        resolutionMetadata: {},
        revocationRegistryDefinitionId: 'id',
      });

      // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access,@typescript-eslint/no-unsafe-call
      await expect((registry as any).resolveRevocationStatusList('id', 123))
        .rejects.toThrowError(/entries topic id is missing/i);
    });
  });

});
