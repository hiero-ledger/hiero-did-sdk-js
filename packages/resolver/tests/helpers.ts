import {
  KeysUtility,
  PublicKeyInBase58,
  Signer,
  VerificationMethodProperties,
} from '@swiss-digital-assets-institute/core';
import {
  DIDAddServiceMessage,
  DIDAddVerificationMethodMessage,
  DIDDeactivateMessage,
  DIDOwnerMessage,
  DIDRemoveServiceMessage,
  DIDRemoveVerificationMethodMessage,
} from '@swiss-digital-assets-institute/messages';
import { PrivateKey } from '@hashgraph/sdk';
import { DIDResolution } from '@swiss-digital-assets-institute/core';

export const VALID_DID_TOPIC_ID = '0.0.2';
export const VALID_DID_PUBLIC_KEY =
  'J98ruZqvaqtXE6chynQPnrjFu4qRAmofqbzVEsQXvNq4';
export const VALID_DID = `did:hedera:mainnet:${VALID_DID_PUBLIC_KEY}_${VALID_DID_TOPIC_ID}`;
export const VALID_ANOTHER_DID = `did:hedera:mainnet:EEzEMBWymV2cWziV4mVrgW9oFzJ31MteGu25ddMPNTR7_${VALID_DID_TOPIC_ID}`;

interface DIDOwnerOptions {
  controller?: string;
}

export async function getDIDOwnerMessage(options: DIDOwnerOptions = {}) {
  const privateKey = await PrivateKey.generateED25519Async();
  const message = new DIDOwnerMessage({
    publicKey: privateKey.publicKey,
    topicId: VALID_DID_TOPIC_ID,
    controller: options.controller,
    network: 'testnet',
  });

  const signature = privateKey.sign(message.messageBytes);
  message.setSignature(signature);

  const publicKeyMultibase = KeysUtility.fromPublicKey(
    privateKey.publicKey,
  ).toMultibase();

  return {
    message: message.payload,
    privateKey,
    did: message.did,
    publicKeyMultibase,
  };
}

interface AddVerificationMethodOptions {
  privateKey: PrivateKey;
  did: string;
  property: VerificationMethodProperties;
  keyId: string;
  signature?: Uint8Array;
}

export async function getAddVerificationMethodMessage(
  options: AddVerificationMethodOptions,
) {
  const newPrivateKey = await PrivateKey.generateED25519Async();
  const publicKeyMultibase = KeysUtility.fromPublicKey(
    newPrivateKey.publicKey,
  ).toMultibase();
  const message = new DIDAddVerificationMethodMessage({
    publicKeyMultibase,
    controller: options.did,
    property: options.property,
    id: `#${options.keyId}`,
    did: options.did,
  });

  if (options.signature) {
    message.setSignature(options.signature);
  } else {
    const signature = options.privateKey.sign(message.messageBytes);
    message.setSignature(signature);
  }

  return {
    message: message.payload,
    publicKeyMultibase,
  };
}

interface RemoveVerificationMethodOptions {
  privateKey: PrivateKey;
  did: string;
  property: VerificationMethodProperties;
  keyId: string;
}

export function getRemoveVerificationMethodMessage(
  options: RemoveVerificationMethodOptions,
) {
  const message = new DIDRemoveVerificationMethodMessage({
    property: options.property,
    id: `#${options.keyId}`,
    did: options.did,
  });

  const signature = options.privateKey.sign(message.messageBytes);
  message.setSignature(signature);

  return {
    message: message.payload,
  };
}

interface AddServiceOptions {
  privateKey: PrivateKey;
  did: string;
  serviceId: string;
}

export function getAddServiceMessage(options: AddServiceOptions) {
  const message = new DIDAddServiceMessage({
    id: `#${options.serviceId}`,
    did: options.did,
    type: 'VerifiableCredentialService',
    serviceEndpoint: 'https://example.com/credentials',
  });

  const signature = options.privateKey.sign(message.messageBytes);
  message.setSignature(signature);

  return {
    message: message.payload,
  };
}

interface RemoveServiceOptions {
  privateKey: PrivateKey;
  did: string;
  serviceId: string;
}

export function getRemoveServiceMessage(options: RemoveServiceOptions) {
  const message = new DIDRemoveServiceMessage({
    id: `#${options.serviceId}`,
    did: options.did,
  });

  const signature = options.privateKey.sign(message.messageBytes);
  message.setSignature(signature);

  return {
    message: message.payload,
  };
}

interface DeactivateOptions {
  privateKey: PrivateKey;
  did: string;
  signature?: Uint8Array;
}

export function getDeactivateMessage(options: DeactivateOptions) {
  const message = new DIDDeactivateMessage({
    did: options.did,
  });

  if (options.signature) {
    message.setSignature(options.signature);
  } else {
    const signature = options.privateKey.sign(message.messageBytes);
    message.setSignature(signature);
  }

  return {
    message: message.payload,
  };
}

export class TestSigner implements Signer {
  constructor(
    public readonly signMock: jest.Mock = jest.fn(),
    public readonly publicKeyMock: jest.Mock = jest.fn(),
    public readonly verifyMock: jest.Mock = jest.fn(),
  ) {}

  sign(data: Uint8Array): Uint8Array {
    return this.signMock(data) as never;
  }

  publicKey(): PublicKeyInBase58 {
    return this.publicKeyMock() as never;
  }

  verify(message: Uint8Array, signature: Uint8Array): boolean {
    return this.verifyMock(message, signature) as never;
  }
}

export const DID_RESOLUTION: DIDResolution = {
  didDocument: {
    '@context': 'https://w3id.org/did-resolution/v1',
    id: VALID_DID,
    controller: VALID_DID,
    verificationMethod: [
      {
        id: `${VALID_DID}#did-root-key`,
        type: 'Ed25519VerificationKey2020',
        controller: VALID_DID,
        publicKeyMultibase: `z${VALID_DID_PUBLIC_KEY},`,
      },
    ],
    assertionMethod: ['#did-root-key'],
    authentication: ['#did-root-key'],
    capabilityInvocation: ['#did-root-key'],
    capabilityDelegation: ['#did-root-key'],
    keyAgreement: [
      {
        id: `${VALID_DID}#key-1`,
        type: 'Ed25519VerificationKey2020',
        controller: VALID_DID,
        publicKeyMultibase: `z${VALID_DID_PUBLIC_KEY},`,
      },
    ],
    service: [
      {
        id: `#srv-1`,
        type: 'LinkedResource',
        serviceEndpoint: 'https://example.com/1',
      },
      {
        id: `${VALID_DID}#srv-2`,
        type: 'LinkedResource',
        serviceEndpoint: 'https://example.com/2/',
      },
      {
        id: `${VALID_DID}#srv-invalid`,
        type: 'LinkedResource',
        serviceEndpoint: 1 as never,
      },
      {
        id: `${VALID_DID}#srv-multiple`,
        type: 'LinkedResource',
        serviceEndpoint: [
          'https://example.com/3/',
          'https://example.com/4/',
        ] as never,
      },
    ],
  },
  didDocumentMetadata: {
    created: new Date().toISOString(),
    updated: new Date().toISOString(),
    deactivated: false,
  },
  didResolutionMetadata: {
    contentType:
      'application/ld+json;profile="https://w3id.org/did-resolution"',
    retrieved: new Date().toISOString(),
  },
};
