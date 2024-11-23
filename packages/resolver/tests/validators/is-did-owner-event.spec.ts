import { isDIDOwnerEvent } from '../../src/validators/is-did-owner-event';
import { VALID_DID } from '../helpers';

describe('isDIDOwnerEvent validator', () => {
  it.each([
    {
      DIDOwner: {
        id: `${VALID_DID}`,
        type: 'Ed25519VerificationKey2018',
        controller: VALID_DID,
        publicKeyBase58: '6Mkq8X7Q7Jz3k3',
      },
    },
    {
      DIDOwner: {
        id: `${VALID_DID}`,
        type: 'Ed25519VerificationKey2020',
        controller: VALID_DID,
        publicKeyMultibase: 'z6Mkq8X7Q7Jz3k3',
      },
    },
  ])('should return true for valid DIDOwnerEvent', (eventObject) => {
    expect(isDIDOwnerEvent(eventObject)).toBe(true);
  });

  it.each([
    {
      id: `${VALID_DID}`,
      type: 'Ed25519VerificationKey2018',
      controller: VALID_DID,
      publicKeyBase58: '6Mkq8X7Q7Jz3k3',
    }, // Missing DIDOwner key
    {
      DIDOwner: {
        id: `invalid`,
        type: 'Ed25519VerificationKey2018',
        controller: VALID_DID,
        publicKeyBase58: '6Mkq8X7Q7Jz3k3',
      },
    }, // Invalid id
    {
      DIDOwner: {
        id: `${VALID_DID}#key-1`,
        type: 'Ed25519VerificationKey2018',
        controller: VALID_DID,
        publicKeyBase58: '6Mkq8X7Q7Jz3k3',
      },
    }, // Invalid id
    {
      DIDOwner: {
        type: 'Ed25519VerificationKey2018',
        controller: VALID_DID,
        publicKeyBase58: '6Mkq8X7Q7Jz3k3',
      },
    }, // Missing id
    {
      DIDOwner: {
        id: `${VALID_DID}#key-1`,
        controller: VALID_DID,
        publicKeyBase58: '6Mkq8X7Q7Jz3k3',
      },
    }, // Missing type
    {
      DIDOwner: {
        id: `${VALID_DID}#key-1`,
        type: 'Ed25519VerificationKey2018',
        publicKeyBase58: '6Mkq8X7Q7Jz3k3',
      },
    }, // Missing controller
    {
      DIDOwner: {
        id: `${VALID_DID}#key-1`,
        type: 'Ed25519VerificationKey2018',
        controller: VALID_DID,
      },
    }, // Missing publicKeyBase58 and publicKeyMultibase
    {
      DIDOwner: {
        id: `${VALID_DID}#key-1`,
        type: 123,
        controller: VALID_DID,
        publicKeyBase58: '6Mkq8X7Q7Jz3k3',
      },
    }, // Invalid type
    {
      DIDOwner: {
        id: `${VALID_DID}#key-1`,
        type: 'Ed25519VerificationKey2018',
        controller: 123,
        publicKeyBase58: '6Mkq8X7Q7Jz3k3',
      },
    }, // Invalid controller
    {
      DIDOwner: {
        id: `${VALID_DID}#key-1`,
        type: 'Ed25519VerificationKey2018',
        controller: 'invalid',
        publicKeyBase58: '6Mkq8X7Q7Jz3k3',
      },
    }, // Invalid controller
    {
      DIDOwner: {
        id: `${VALID_DID}#key-1`,
        type: 'Ed25519VerificationKey2018',
        controller: VALID_DID,
        publicKeyBase58: 123,
      },
    }, // Invalid publicKeyBase58
    {
      DIDOwner: {
        id: `${VALID_DID}#key-1`,
        type: 'Ed25519VerificationKey2018',
        controller: VALID_DID,
        publicKeyMultibase: 123,
      },
    }, // Invalid publicKeyMultibase
    {
      DIDOwner: {
        id: `${VALID_DID}#key-1`,
        type: {},
        controller: {},
        publicKeyBase58: {},
      },
    }, // Invalid type, controller and publicKeyBase58
    'invalid', // Invalid type
    {
      DIDOwner: 'invalid',
    }, // Invalid DIDOwner
  ])('should return false for invalid DIDOwnerEvent', (eventObject) => {
    expect(isDIDOwnerEvent(eventObject)).toBe(false);
  });
});
