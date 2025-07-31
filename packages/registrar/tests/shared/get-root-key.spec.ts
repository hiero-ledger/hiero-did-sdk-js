import {
  DID_ROOT_KEY_ID,
  DIDDocument,
} from '@hiero-did-sdk/core';
import { getDIDRootKey } from '../../src/shared/get-root-key';
import { VALID_DID } from '../helpers';
import { PrivateKey } from '@hashgraph/sdk';
import { KeysUtility } from '@hiero-did-sdk/core';

describe('Get Root Key operation', () => {
  let publicKeyBase58: string;
  let publicKeyMultibase: string;

  beforeAll(async () => {
    const privateKey = await PrivateKey.generateED25519Async();
    const publicKey = privateKey.publicKey;
    const keysUtility = KeysUtility.fromPublicKey(publicKey);

    publicKeyBase58 = keysUtility.toBase58();
    publicKeyMultibase = keysUtility.toMultibase();
  });

  it('should extract the root key from the DID Document in base58 format', () => {
    const didDocument: DIDDocument = {
      id: VALID_DID,
      controller: VALID_DID,
      verificationMethod: [
        {
          id: DID_ROOT_KEY_ID,
          type: 'Ed25519VerificationKey2018',
          controller: VALID_DID,
          publicKeyBase58,
        },
      ],
    };

    const result = getDIDRootKey(didDocument);

    expect(result).toBe(publicKeyMultibase);
  });

  it('should extract the root key from the DID Document in multibase format', () => {
    const didDocument: DIDDocument = {
      id: VALID_DID,
      controller: VALID_DID,
      verificationMethod: [
        {
          id: DID_ROOT_KEY_ID,
          type: 'Ed25519VerificationKey2020',
          controller: VALID_DID,
          publicKeyMultibase,
        },
      ],
    };

    const result = getDIDRootKey(didDocument);

    expect(result).toBe(publicKeyMultibase);
  });

  it('should extract the root key from the DID Document with full id', () => {
    const didDocument: DIDDocument = {
      id: VALID_DID,
      controller: VALID_DID,
      verificationMethod: [
        {
          id: `${VALID_DID}${DID_ROOT_KEY_ID}`,
          type: 'Ed25519VerificationKey2020',
          controller: VALID_DID,
          publicKeyMultibase,
        },
      ],
    };

    const result = getDIDRootKey(didDocument);

    expect(result).toBe(publicKeyMultibase);
  });

  it('should extract the root key from the DID Document  when more keys available', () => {
    const didDocument: DIDDocument = {
      id: VALID_DID,
      controller: VALID_DID,
      verificationMethod: [
        {
          id: '#key-1',
          type: 'Ed25519VerificationKey2020',
          controller: VALID_DID,
          publicKeyMultibase: 'key-1',
        },
        {
          id: '#key-2',
          type: 'Ed25519VerificationKey2020',
          controller: VALID_DID,
          publicKeyMultibase: 'key-2',
        },
        {
          id: DID_ROOT_KEY_ID,
          type: 'Ed25519VerificationKey2020',
          controller: VALID_DID,
          publicKeyMultibase,
        },
      ],
    };

    const result = getDIDRootKey(didDocument);

    expect(result).toBe(publicKeyMultibase);
  });

  it('should throw an error when the root key is not found', () => {
    const didDocument: DIDDocument = {
      id: VALID_DID,
      controller: VALID_DID,
      verificationMethod: [
        {
          id: '#key-1',
          type: 'Ed25519VerificationKey2020',
          controller: VALID_DID,
          publicKeyMultibase: 'key-1',
        },
      ],
    };

    expect(() => getDIDRootKey(didDocument)).toThrow(
      'DID root key not found in a DID Document',
    );
  });

  it('should throw an error when the there is no verification methods', () => {
    const didDocument = {
      id: VALID_DID,
      controller: VALID_DID,
    };

    expect(() => getDIDRootKey(didDocument as never)).toThrow(
      'DID root key not found in a DID Document',
    );
  });
});
