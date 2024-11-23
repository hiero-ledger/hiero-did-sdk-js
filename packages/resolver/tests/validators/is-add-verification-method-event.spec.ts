import { isAddVerificationMethodEvent } from '../../src/validators/is-add-verification-method-event';
import { VALID_DID } from '../helpers';

export const VALID = [
  {
    VerificationMethod: {
      id: `${VALID_DID}#key-1`,
      type: 'Ed25519VerificationKey2020',
      controller: VALID_DID,
      publicKeyMultibase: 'z6Mkq8X7Q7Jz3k3',
    },
  },
  {
    VerificationMethod: {
      id: `${VALID_DID}#key-1`,
      type: 'Ed25519VerificationKey2018',
      controller: VALID_DID,
      publicKeyBase58: '6Mkq8X7Q7Jz3k3',
    },
  },
];

export const INVALID = [
  {
    id: `${VALID_DID}#key-1`,
    type: 'Ed25519VerificationKey2018',
    controller: VALID_DID,
    publicKeyBase58: '6Mkq8X7Q7Jz3k3',
  }, // Missing VerificationMethod key
  {
    VerificationMethod: {
      id: `invalid`,
      type: 'Ed25519VerificationKey2018',
      controller: VALID_DID,
      publicKeyBase58: '6Mkq8X7Q7Jz3k3',
    },
  }, // Invalid id
  {
    VerificationMethod: {
      type: 'Ed25519VerificationKey2018',
      controller: VALID_DID,
      publicKeyBase58: '6Mkq8X7Q7Jz3k3',
    },
  }, // Missing id
  {
    VerificationMethod: {
      id: `${VALID_DID}#key-1`,
      controller: VALID_DID,
      publicKeyBase58: '6Mkq8X7Q7Jz3k3',
    },
  }, // Missing type
  {
    VerificationMethod: {
      id: `${VALID_DID}#key-1`,
      type: 'Ed25519VerificationKey2018',
      publicKeyBase58: '6Mkq8X7Q7Jz3k3',
    },
  }, // Missing controller
  {
    VerificationMethod: {
      id: `${VALID_DID}#key-1`,
      type: 'Ed25519VerificationKey2018',
      controller: VALID_DID,
    },
  }, // Missing publicKeyBase58 and publicKeyMultibase
  {
    VerificationMethod: {
      id: `${VALID_DID}#key-1`,
      type: 123,
      controller: VALID_DID,
      publicKeyBase58: '6Mkq8X7Q7Jz3k3',
    },
  }, // Invalid type
  {
    VerificationMethod: {
      id: `${VALID_DID}#key-1`,
      type: 'Ed25519VerificationKey2018',
      controller: 123,
      publicKeyBase58: '6Mkq8X7Q7Jz3k3',
    },
  }, // Invalid controller
  {
    VerificationMethod: {
      id: `${VALID_DID}#key-1`,
      type: 'Ed25519VerificationKey2018',
      controller: 'invalid',
      publicKeyBase58: '6Mkq8X7Q7Jz3k3',
    },
  }, // Invalid controller
  {
    VerificationMethod: {
      id: `${VALID_DID}#key-1`,
      type: 'Ed25519VerificationKey2018',
      controller: VALID_DID,
      publicKeyBase58: 123,
    },
  }, // Invalid publicKeyBase58
  {
    VerificationMethod: {
      id: `${VALID_DID}#key-1`,
      type: 'Ed25519VerificationKey2018',
      controller: VALID_DID,
      publicKeyMultibase: 123,
    },
  }, // Invalid publicKeyMultibase
  {
    VerificationMethod: {
      id: `${VALID_DID}#key-1`,
      type: {},
      controller: {},
      publicKeyBase58: {},
    },
  }, // Invalid type, controller and publicKeyBase58
  'invalid', // Invalid type
  {
    VerificationMethod: 'invalid',
  },
];

describe('isAddVerificationMethodEvent validator', () => {
  it.each(VALID)(
    'should return true for valid AddVerificationMethodEvent',
    (eventObject) => {
      expect(isAddVerificationMethodEvent(eventObject)).toBe(true);
    },
  );

  it.each(INVALID)(
    'should return false for invalid AddVerificationMethodEvent',
    (eventObject) => {
      expect(isAddVerificationMethodEvent(eventObject)).toBe(false);
    },
  );
});
