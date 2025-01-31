import { CborCodec, DIDError } from '@swiss-digital-assets-institute/core';
import { resolveDID } from '../src';
import { dereferenceDID } from '../src/dereference-did';
import { DID_RESOLUTION, VALID_DID } from './helpers';

const didDocumentMock = jest.fn();
jest.mock('../src/resolve-did.ts', () => {
  return {
    resolveDID: jest
      .fn()
      .mockImplementation(() => Promise.resolve(didDocumentMock())),
  };
});

describe('DID Dereference', () => {
  it('should throw an error if the DID URL is not supported', async () => {
    await expect(dereferenceDID('did:hedera:test')).rejects.toThrow();
  });

  it('should call resolveDID with the correct parameters', async () => {
    didDocumentMock.mockReturnValue(DID_RESOLUTION);

    await dereferenceDID(`${VALID_DID}#srv-1`);

    expect(resolveDID).toHaveBeenCalledWith(
      VALID_DID,
      'application/ld+json;profile="https://w3id.org/did-resolution"',
      {},
    );
  });

  it('should return dereferenced service in resolution format', async () => {
    didDocumentMock.mockReturnValue(DID_RESOLUTION);

    const result = await dereferenceDID(
      `${VALID_DID}#srv-2`,
      'application/ld+json;profile="https://w3id.org/did-resolution"',
    );

    expect(result).toEqual({
      contentStream: {
        ...DID_RESOLUTION.didDocument.service[1],
        '@context': DID_RESOLUTION.didDocument['@context'],
      },
      dereferencingMetadata: DID_RESOLUTION.didDocumentMetadata,
      contentMetadata: DID_RESOLUTION.didResolutionMetadata,
    });
  });

  it('should return dereferenced service in JSON format', async () => {
    didDocumentMock.mockReturnValue(DID_RESOLUTION);

    const result = await dereferenceDID(
      `${VALID_DID}#srv-2`,
      'application/did+json',
    );

    expect(result).toEqual(DID_RESOLUTION.didDocument.service[1]);
  });

  it('should return dereferenced service in JSON-LD format', async () => {
    didDocumentMock.mockReturnValue(DID_RESOLUTION);

    const result = await dereferenceDID(
      `${VALID_DID}#srv-2`,
      'application/did+ld+json',
    );

    expect(result).toEqual({
      ...DID_RESOLUTION.didDocument.service[1],
      '@context': DID_RESOLUTION.didDocument['@context'],
    });
  });

  it('should return dereferenced service in CBOR format', async () => {
    didDocumentMock.mockReturnValue(DID_RESOLUTION);

    const result = await dereferenceDID(
      `${VALID_DID}#srv-2`,
      'application/did+cbor',
    );

    expect(result).toEqual(
      CborCodec.encode(DID_RESOLUTION.didDocument.service[1]),
    );
  });

  it('should throw an error if the accept header is not supported', async () => {
    didDocumentMock.mockReturnValue(DID_RESOLUTION);

    await expect(
      dereferenceDID(`${VALID_DID}#srv-2`, 'application/json' as never),
    ).rejects.toThrow();
  });

  it('should throw an error when did not found', async () => {
    const error = new DIDError('notFound', 'The DID document was not found');
    didDocumentMock.mockRejectedValue(error);

    await expect(resolveDID(VALID_DID)).rejects.toThrow(error);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });
});
