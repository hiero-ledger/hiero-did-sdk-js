import { resolveDID } from '../src';
import { getAddVerificationMethodMessage, getDIDOwnerMessage } from './helpers';

const messagesMock = jest.fn();
jest.mock('../src/topic-reader.ts', () => {
  return {
    TopicReader: jest.fn().mockImplementation(() => {
      return {
        fetchAllToDate: jest.fn().mockResolvedValue({
          getMessages: jest
            .fn()
            .mockImplementation(() => messagesMock() as never),
        }),
      };
    }),
  };
});

describe('DID Resolver', () => {
  let messages: string[] = [];
  let did: string;

  beforeEach(async () => {
    const didOwnerMessage = await getDIDOwnerMessage();
    const verificationMethod = await getAddVerificationMethodMessage({
      privateKey: didOwnerMessage.privateKey,
      property: 'verificationMethod',
      did: didOwnerMessage.did,
      keyId: 'key-1',
    });

    did = didOwnerMessage.did;

    messages = [didOwnerMessage.message, verificationMethod.message];
  });

  it('should resolve a did document to json-ld format', async () => {
    messagesMock.mockReturnValue(messages);

    const didDocument = await resolveDID(did);

    expect(didDocument).toBeDefined();
    expect(didDocument).toStrictEqual({
      '@context': expect.arrayContaining([expect.any(String)]),
      id: did,
      controller: did,
      verificationMethod: [
        {
          id: `${did}#did-root-key`,
          type: 'Ed25519VerificationKey2020',
          controller: did,
          publicKeyMultibase: expect.any(String),
        },
        {
          id: `${did}#key-1`,
          type: 'Ed25519VerificationKey2020',
          controller: did,
          publicKeyMultibase: expect.any(String),
        },
      ],
    });
  });

  it('should resolve a did document to json format', async () => {
    messagesMock.mockReturnValue(messages);

    const didDocument = await resolveDID(did, 'application/did+json');

    expect(didDocument).toBeDefined();
    expect(didDocument).toStrictEqual({
      id: did,
      controller: did,
      verificationMethod: [
        {
          id: `${did}#did-root-key`,
          type: 'Ed25519VerificationKey2020',
          controller: did,
          publicKeyMultibase: expect.any(String),
        },
        {
          id: `${did}#key-1`,
          type: 'Ed25519VerificationKey2020',
          controller: did,
          publicKeyMultibase: expect.any(String),
        },
      ],
    });
  });

  it('should resolve a did document to full resolution format', async () => {
    messagesMock.mockReturnValue(messages);

    const didDocument = await resolveDID(
      did,
      'application/ld+json;profile="https://w3id.org/did-resolution"',
    );

    expect(didDocument).toBeDefined();
    expect(didDocument).toStrictEqual({
      didDocumentMetadata: {
        created: expect.any(String),
        updated: expect.any(String),
        deactivated: false,
      },
      didResolutionMetadata: {
        contentType:
          'application/ld+json;profile="https://w3id.org/did-resolution"',
      },
      didDocument: {
        '@context': expect.arrayContaining([expect.any(String)]),
        id: did,
        controller: did,
        verificationMethod: [
          {
            id: `${did}#did-root-key`,
            type: 'Ed25519VerificationKey2020',
            controller: did,
            publicKeyMultibase: expect.any(String),
          },
          {
            id: `${did}#key-1`,
            type: 'Ed25519VerificationKey2020',
            controller: did,
            publicKeyMultibase: expect.any(String),
          },
        ],
      },
    });
  });

  it('should throw an error for invalid accept option', async () => {
    messagesMock.mockReturnValue(messages);

    await expect(resolveDID(did, 'invalid' as never)).rejects.toThrow(
      'Unsupported `accept` value',
    );
  });

  it('should throw an error for invalid did', async () => {
    messagesMock.mockReturnValue(messages);

    await expect(resolveDID('did:hedera:testnet:zguayisd')).rejects.toThrow(
      'Unsupported DID method or invalid DID URL',
    );
  });

  afterEach(() => {
    jest.clearAllMocks();
  });
});
