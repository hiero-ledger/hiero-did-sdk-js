import { CborCodec, DIDError } from '@hiero-did-sdk/core';
import { resolveDID } from '../src';
import { getAddVerificationMethodMessage, getDIDOwnerMessage } from './helpers';

const messagesMock = jest.fn();
jest.mock('../src/topic-readers/topic-reader-hedera-client.ts', () => {
  return {
    TopicReaderHederaClient: jest.fn().mockImplementation(() => {
      return {
        fetchAllToDate: jest.fn().mockImplementation(() => messagesMock() as never),
      };
    }),
  };
});

describe('DID Resolver', () => {
  let messages: string[] = [];
  let did: string;
  let didOwnerPublicKey: string;
  let vmPublicKey: string;

  beforeEach(async () => {
    const didOwnerMessage = await getDIDOwnerMessage();
    const verificationMethod = await getAddVerificationMethodMessage({
      privateKey: didOwnerMessage.privateKey,
      property: 'verificationMethod',
      did: didOwnerMessage.did,
      keyId: 'key-1',
    });

    did = didOwnerMessage.did;

    didOwnerPublicKey = didOwnerMessage.publicKeyMultibase;
    vmPublicKey = verificationMethod.publicKeyMultibase;

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
          publicKeyMultibase: didOwnerPublicKey,
        },
        {
          id: `${did}#key-1`,
          type: 'Ed25519VerificationKey2020',
          controller: did,
          publicKeyMultibase: vmPublicKey,
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
          publicKeyMultibase: didOwnerPublicKey,
        },
        {
          id: `${did}#key-1`,
          type: 'Ed25519VerificationKey2020',
          controller: did,
          publicKeyMultibase: vmPublicKey,
        },
      ],
    });
  });

  it('should resolve a did document to full resolution format', async () => {
    messagesMock.mockReturnValue(messages);

    const didDocument = await resolveDID(did, 'application/ld+json;profile="https://w3id.org/did-resolution"');

    expect(didDocument).toBeDefined();
    expect(didDocument).toStrictEqual({
      didDocumentMetadata: {
        created: expect.any(String),
        updated: expect.any(String),
        deactivated: false,
      },
      didResolutionMetadata: {
        contentType: 'application/ld+json;profile="https://w3id.org/did-resolution"',
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
            publicKeyMultibase: didOwnerPublicKey,
          },
          {
            id: `${did}#key-1`,
            type: 'Ed25519VerificationKey2020',
            controller: did,
            publicKeyMultibase: vmPublicKey,
          },
        ],
      },
    });
  });

  it('should resolve a did document to CBOR format', async () => {
    messagesMock.mockReturnValue(messages);

    const didDocument = await resolveDID(did, 'application/did+cbor');

    expect(didDocument).toBeDefined();
    expect(didDocument).toStrictEqual(
      CborCodec.encode({
        id: did,
        controller: did,
        verificationMethod: [
          {
            id: `${did}#did-root-key`,
            controller: did,
            type: 'Ed25519VerificationKey2020',
            publicKeyMultibase: didOwnerPublicKey,
          },
          {
            id: `${did}#key-1`,
            type: 'Ed25519VerificationKey2020',
            controller: did,
            publicKeyMultibase: vmPublicKey,
          },
        ],
      })
    );
  });

  it('should throw an error for invalid accept option', async () => {
    messagesMock.mockReturnValue(messages);

    await expect(resolveDID(did, 'invalid' as never)).rejects.toThrow('Unsupported representation format');
  });

  it('should throw an error for invalid did', async () => {
    messagesMock.mockReturnValue(messages);

    await expect(resolveDID('did:hedera:testnet:zguayisd')).rejects.toThrow('Unsupported DID method or invalid DID');
  });

  it('should throw an error when did not found', async () => {
    messagesMock.mockReturnValue([]);

    await expect(resolveDID(did)).rejects.toThrow(new DIDError('notFound', 'The DID document was not found'));
  });

  afterEach(() => {
    jest.clearAllMocks();
  });
});
