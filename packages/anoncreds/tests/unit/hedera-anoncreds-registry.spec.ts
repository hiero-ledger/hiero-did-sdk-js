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

    // id example: "did:hedera:testnet:zFAeKMsqnNc2bwEsC8oqENBvGqjpGu9tpUi3VWaFEBXBo_0.0.5896419/anoncreds/v0/SCHEMA/0.0.5896422"
    (buildAnonCredsIdentifier as jest.Mock).mockImplementation(
      (issuerId: string, topicId: string, type: string) => `did:hedera:testnet:${issuerId}/anoncreds/v0/${type}/${topicId}`
    );
    (parseAnonCredsIdentifier as jest.Mock).mockImplementation((id: string) => {
      const sections = id.split('/');
      const parts = sections[0].split(':');
      return {
        networkName: parts[2] || 'testnet',
        topicId: sections[4] || 'topicId',
      };
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
      const result = await registry.registerSchema({ schema, networkName: 'testnet' });

      expect(result.schemaState.state).toBe('finished');
      expect(result.schemaState.schema).toEqual(schema);
      expect(serviceMock.submitFile).toHaveBeenCalledWith(expect.objectContaining({
        networkName: 'testnet',
        payload: Buffer.from(JSON.stringify(schema)),
        waitForChangesVisibility: true,
      }));
    });

    it('should fail to register schema and return failure reason', async () => {
      serviceMock.submitFile.mockRejectedValue(new Error('fail'));

      const schema: AnonCredsSchema = {
        issuerId: 'issuer1',
        name: 'schema1',
        version: '1.0',
        attrNames: [],
      };
      const result = await registry.registerSchema({ schema, networkName: 'testnet' });

      expect(result.schemaState.state).toBe('failed');
      const failedState = result.schemaState as RegisterSchemaReturnStateFailed;
      expect(failedState.reason).toBe('fail');
    });
  });

  describe('getSchema', () => {
    it('should get schema from registry successfully', async () => {
      const schemaObj = { data: 'schema-data' };
      serviceMock.resolveFile.mockResolvedValue(Buffer.from(JSON.stringify(schemaObj)));

      const id = 'did:hedera:testnet:zFAeKMsqnNc2bwEsC8oqENBvGqjpGu9tpUi3VWaFEBXBo_0.0.5896419/anoncreds/v0/SCHEMA/0.0.5896422'
      const result = await registry.getSchema(id);

      expect(result.schemaId).toBe(id);
      expect(result.schema).toEqual(schemaObj);
      expect(serviceMock.resolveFile).toHaveBeenCalledWith({networkName: "testnet", topicId: "0.0.5896422"});
    });
  });

  describe('registerCredentialDefinition', () => {
    it('should register credential definition successfully', async () => {
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
      const options = { credentialDefinition, networkName: 'testnet', options: { supportRevocation: true } };

      const result = await registry.registerCredentialDefinition(options);

      expect(result.credentialDefinitionState.state).toBe('finished');
      expect(result.credentialDefinitionState.credentialDefinition).toEqual(credentialDefinition);

      expect(result.credentialDefinitionMetadata).toEqual(options.options);
    });

    it('should fail to register credential definition and return failure reason', async () => {
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
      };

      const result = await registry.registerCredentialDefinition(options);

      expect(result.credentialDefinitionState.state).toBe('failed');
      const failedState = result.credentialDefinitionState as RegisterCredentialDefinitionReturnStateFailed;
      expect(failedState.reason).toContain('fail');
    });
  });

  describe('getCredentialDefinition', () => {
    it('should get credential definition from registry successfully', async () => {
      const credentialDefinition = { data: 'credDef' };
      serviceMock.resolveFile.mockResolvedValue(Buffer.from(JSON.stringify(credentialDefinition)));

      const id = 'issuer|credDefTopic|PUBLIC_CRED_DEF';
      const result = await registry.getCredentialDefinition(id);

      expect(result.credentialDefinitionId).toBe(id);
      expect(result.credentialDefinition).toEqual(credentialDefinition);
    });
  });

  describe('registerRevocationRegistryDefinition', () => {
    it('should register revocation registry definition successfully', async () => {
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
      });

      expect(result.revocationRegistryDefinitionState.state).toBe('finished');
      expect(result.revocationRegistryDefinitionMetadata.entriesTopicId).toBe('entries-topic-id');
      expect(result.revocationRegistryDefinitionState.revocationRegistryDefinition).toEqual(
        revocationRegistryDefinition
      );
    });

    it('should fail to register revocation registry definition and return failure reason', async () => {
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
      });

      expect(result.revocationRegistryDefinitionState.state).toBe('failed');
      const failedState =
        result.revocationRegistryDefinitionState as RegisterRevocationRegistryDefinitionReturnStateFailed;
      expect(failedState.reason).toBe('fail');
    });
  });

  describe('getRevocationRegistryDefinition', () => {
    it('should get revocation registry definition from registry successfully', async () => {
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

    it('should fail to get revocation registry definition and return error metadata', async () => {
      serviceMock.resolveFile.mockRejectedValue(new Error('fail'));

      const id = 'issuer3|topicId|REV_REG';

      const result = await registry.getRevocationRegistryDefinition(id);

      expect(result.resolutionMetadata.error).toBe('invalid');
      expect(result.resolutionMetadata.message).toBe('fail');
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
      });

      expect(result.revocationStatusListState.state).toBe('finished');
      expect(serviceMock.submitMessage).toBeCalledWith(expect.objectContaining({ topicId: 'entries-topic-id' }));
    });

    it('should fail to register revocation status list and return failure reason', async () => {
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
      });

      expect(result.revocationStatusListState.state).toBe('failed');
      const failedState = result.revocationStatusListState as RegisterRevocationStatusListReturnStateFailed;
      expect(failedState.reason).toBe('fail');
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

    it('should return notFound error if revocation status list is undefined', async () => {
      jest
        .spyOn(registry as any, 'resolveRevocationStatusList')
        .mockResolvedValue({ entriesTopicId: 'topic', statusList: undefined });

      const result = await registry.getRevocationStatusList('id', 123);

      expect(result.revocationStatusList).toBeUndefined();
      expect(result.resolutionMetadata.error).toBe('notFound');
    });

    it('should return invalid error if resolving revocation status list rejects', async () => {
      jest.spyOn(registry as any, 'resolveRevocationStatusList').mockRejectedValue(new Error('fail'));

      const result = await registry.getRevocationStatusList('id', 123);

      expect(result.revocationStatusList).toBeUndefined();
      expect(result.resolutionMetadata.error).toBe('invalid');
      expect(result.resolutionMetadata.message).toBe('fail');
    });
  });

  describe('getStatusListDiff', () => {
    it('should return correct issued and revoked diffs', () => {
      const original = [0, 1, 0, 1];
      const modified = [1, 0, 0, 1];

      // eslint-disable-next-line @typescript-eslint/no-unsafe-call,@typescript-eslint/no-unsafe-member-access
      const result: { issued: number[]; revoked: number[] } = (registry as any).getStatusListDiff(original, modified);

      expect(result.issued).toEqual([1]);
      expect(result.revoked).toEqual([0]);
    });

    it('should throw error if status lists lengths differ', () => {
      // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access,@typescript-eslint/no-unsafe-call,@typescript-eslint/no-unsafe-return
      expect(() => (registry as any).getStatusListDiff([0], [0, 1])).toThrow();
    });

    it('should throw error if status lists contain invalid values', () => {
      // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access,@typescript-eslint/no-unsafe-call,@typescript-eslint/no-unsafe-return
      expect(() => (registry as any).getStatusListDiff([2], [0])).toThrow();
      // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access,@typescript-eslint/no-unsafe-call,@typescript-eslint/no-unsafe-return
      expect(() => (registry as any).getStatusListDiff([0], [3])).toThrow();
    });
  });

  describe('packRevocationRegistryEntryMessage', () => {
    it('should pack and compress a revocation registry entry message', () => {
      (Zstd.compress as jest.Mock).mockImplementation(() => Buffer.from('compressed'));
      const messageData = { value: { accum: 'accum1' } };
      // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access,@typescript-eslint/no-unsafe-call
      const result = (registry as any).packRevocationRegistryEntryMessage(messageData);

      expect(typeof result).toBe('string');
      expect(result).toContain('payload');
    });
  });

  describe('extractRevocationRegistryEntryMessage', () => {
    it('should extract and decompress a revocation registry entry message', () => {
      const inner = JSON.stringify({ value: { accum: 'accum1' } });
      (Zstd.decompress as jest.Mock).mockImplementation(() => Buffer.from(inner));
      const wrapper = { payload: Buffer.from(inner).toString('base64') };

      const data = Buffer.from(JSON.stringify(wrapper));
      // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access,@typescript-eslint/no-unsafe-call
      const result = (registry as any).extractRevocationRegistryEntryMessage(data);

      expect(result).toHaveProperty('value.accum', 'accum1');
    });

    it('should return undefined for invalid message data', () => {
      const data = Buffer.from('invalid');
      // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access,@typescript-eslint/no-unsafe-call
      const result = (registry as any).extractRevocationRegistryEntryMessage(data);
      expect(result).toBeUndefined();
    });
  });

  describe('verifyRevocationRegistryEntryMessage', () => {
    it('should verify message successfully if accum exists', () => {
      const data = { value: { accum: 'accum' } };
      // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access,@typescript-eslint/no-unsafe-call
      expect((registry as any).verifyRevocationRegistryEntryMessage(data)).toBe(true);
    });

    it('should fail verification if accum is missing', () => {
      // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access,@typescript-eslint/no-unsafe-call
      expect((registry as any).verifyRevocationRegistryEntryMessage({ value: {} })).toBe(false);
    });
  });

  describe('private resolveRevocationRegistryDefinition', () => {
    it('should throw error if revocation registry payload is not found', async () => {
      serviceMock.resolveFile.mockResolvedValue(null);

      const revRegId = 'did:hedera:testnet:zFAeKMsqnNc2bwEsC8oqENBvGqjpGu9tpUi3VWaFEBXBo_0.0.5896419/anoncreds/v0/REV_REG/0.0.5896422'

      // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access,@typescript-eslint/no-unsafe-call
      await expect((registry as any).resolveRevocationRegistryDefinition(revRegId)).rejects.toThrowError(
        `AnonCreds revocation registry with id ${revRegId} not found`
      );

      expect(serviceMock.resolveFile).toHaveBeenCalledWith({networkName: "testnet", "topicId": "0.0.5896422" } );
    });
  });

  describe('private resolveRevocationStatusList - empty messages', () => {
    it('should return undefined statusList if no messages are found', async () => {
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

  describe('private resolveRevocationStatusList - filtering invalid messages', () => {
    it('should filter out invalid or unverifiable messages when resolving status list', async () => {
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

      expect(extractMock).toHaveBeenCalledWith(Buffer.from('good data'));
      expect(verifyMock).toHaveBeenCalledWith({ value: { accum: 'accum', issued: [0], revoked: [] } });
    });
  });

  describe('resolveRevocationStatusList error handling', () => {
    it('should throw error if revocation registry definition is missing', async () => {
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

    it('should throw error if entriesTopicId is missing', async () => {
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
