import { DIDDocument } from '@hiero-did-sdk/core';
import { fragmentSearch } from '../../src/update-did/helpers/fragment-search';

describe('Fragment Search', () => {
  it('should find a fragment in a DID document', () => {
    const didDocument: DIDDocument = {
      id: 'did:example:123',
      controller: 'did:example:123',
      authentication: [
        {
          id: '#key-1',
          type: 'Ed25519VerificationKey2020',
          controller: 'did:example:1231',
          publicKeyMultibase: 'z6Mkq3n1',
        },
      ],
      keyAgreement: [
        {
          id: '#key-2',
          type: 'Ed25519VerificationKey2020',
          controller: 'did:example:1232',
          publicKeyMultibase: 'z6Mkq3n2',
        },
      ],
      verificationMethod: [
        {
          id: 'did:example:123#key-3',
          type: 'Ed25519VerificationKey2020',
          controller: 'did:example:1233',
          publicKeyMultibase: 'z6Mkq3n3',
        },
      ],
    };

    const fragment = '#key-2';
    const result = fragmentSearch(fragment, didDocument);
    expect(result.found).toBeTruthy();
    expect(result.item).toEqual(didDocument.keyAgreement[0]);
    expect(result.property).toEqual('keyAgreement');
  });

  it('should find a fragment in a DID document with full DID as ID', () => {
    const didDocument: DIDDocument = {
      id: 'did:example:123',
      controller: 'did:example:123',
      authentication: [
        {
          id: '#key-1',
          type: 'Ed25519VerificationKey2020',
          controller: 'did:example:1231',
          publicKeyMultibase: 'z6Mkq3n1',
        },
      ],
      keyAgreement: [
        {
          id: '#key-2',
          type: 'Ed25519VerificationKey2020',
          controller: 'did:example:1232',
          publicKeyMultibase: 'z6Mkq3n2',
        },
      ],
      verificationMethod: [
        {
          id: 'did:example:123#key-3',
          type: 'Ed25519VerificationKey2020',
          controller: 'did:example:1233',
          publicKeyMultibase: 'z6Mkq3n3',
        },
      ],
    };

    const fragment = '#key-3';
    const result = fragmentSearch(fragment, didDocument);
    expect(result.found).toBeTruthy();
    expect(result.item).toEqual(didDocument.verificationMethod[0]);
    expect(result.property).toEqual('verificationMethod');
  });

  it('should omit an aliases', () => {
    const didDocument: DIDDocument = {
      id: 'did:example:123',
      controller: 'did:example:123',
      authentication: ['did:example:123#key-2'],
      verificationMethod: [
        {
          id: '#key-2',
          type: 'Ed25519VerificationKey2020',
          controller: 'did:example:123',
          publicKeyMultibase: 'z6Mkq3n2',
        },
      ],
    };

    const fragment = '#key-2';
    const result = fragmentSearch(fragment, didDocument);
    expect(result.found).toBeTruthy();
    expect(result.item).toEqual(didDocument.verificationMethod[0]);
    expect(result.property).toEqual('verificationMethod');
  });

  it('should not find a fragment in a DID document', () => {
    const didDocument: DIDDocument = {
      id: 'did:example:123',
      controller: 'did:example:123',
      verificationMethod: [
        {
          id: '#key-2',
          type: 'Ed25519VerificationKey2020',
          controller: 'did:example:123',
          publicKeyMultibase: 'z6Mkq3n2',
        },
      ],
    };

    const fragment = '#key-1';
    const result = fragmentSearch(fragment, didDocument);
    expect(result.found).toBeFalsy();
    expect(result.item).toBeUndefined();
    expect(result.property).toBeUndefined();
  });
});
