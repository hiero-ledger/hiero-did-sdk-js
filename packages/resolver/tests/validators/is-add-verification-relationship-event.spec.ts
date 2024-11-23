import { isAddVerificationRelationshipEvent } from '../../src/validators/is-add-verification-relationship-event';
import { VALID_DID } from '../helpers';

export const VALID = [
  {
    VerificationRelationship: {
      id: `${VALID_DID}#key-1`,
      type: 'Ed25519VerificationKey2020',
      relationshipType: 'authentication',
      controller: VALID_DID,
      publicKeyMultibase: 'z6Mkq8X7Q7Jz3k3',
    },
  },
  {
    VerificationRelationship: {
      id: `${VALID_DID}#key-1`,
      type: 'Ed25519VerificationKey2018',
      relationshipType: 'assertionMethod',
      controller: VALID_DID,
      publicKeyBase58: '6Mkq8X7Q7Jz3k3',
    },
  },
  {
    VerificationRelationship: {
      id: `${VALID_DID}#key-1`,
      type: 'Ed25519VerificationKey2018',
      relationshipType: 'keyAgreement',
      controller: VALID_DID,
      publicKeyBase58: '6Mkq8X7Q7Jz3k3',
    },
  },
  {
    VerificationRelationship: {
      id: `${VALID_DID}#key-1`,
      type: 'Ed25519VerificationKey2018',
      relationshipType: 'capabilityInvocation',
      controller: VALID_DID,
      publicKeyBase58: '6Mkq8X7Q7Jz3k3',
    },
  },
  {
    VerificationRelationship: {
      id: `${VALID_DID}#key-1`,
      type: 'Ed25519VerificationKey2018',
      relationshipType: 'capabilityDelegation',
      controller: VALID_DID,
      publicKeyBase58: '6Mkq8X7Q7Jz3k3',
    },
  },
];

export const INVALID = [
  {
    id: `${VALID_DID}#key-1`,
    type: 'Ed25519VerificationKey2020',
    relationshipType: 'authentication',
    controller: VALID_DID,
    publicKeyMultibase: 'z6Mkq8X7Q7Jz3k3',
  }, // Missing VerificationRelationship key
  {
    VerificationRelationship: {
      id: `invalid`,
      type: 'Ed25519VerificationKey2020',
      relationshipType: 'authentication',
      controller: VALID_DID,
      publicKeyMultibase: 'z6Mkq8X7Q7Jz3k3',
    },
  }, // Invalid id
  {
    VerificationRelationship: {
      type: 'Ed25519VerificationKey2020',
      relationshipType: 'authentication',
      controller: VALID_DID,
      publicKeyMultibase: 'z6Mkq8X7Q7Jz3k3',
    },
  }, // Missing id
  {
    VerificationRelationship: {
      id: `${VALID_DID}#key-1`,
      relationshipType: 'authentication',
      controller: VALID_DID,
      publicKeyMultibase: 'z6Mkq8X7Q7Jz3k3',
    },
  }, // Missing type
  {
    VerificationRelationship: {
      id: `${VALID_DID}#key-1`,
      type: 'Ed25519VerificationKey2020',
      controller: VALID_DID,
      publicKeyMultibase: 'z6Mkq8X7Q7Jz3k3',
    },
  }, // Missing relationshipType
  {
    VerificationRelationship: {
      id: `${VALID_DID}#key-1`,
      type: 'Ed25519VerificationKey2020',
      relationshipType: 'invalid',
      controller: VALID_DID,
      publicKeyMultibase: 'z6Mkq8X7Q7Jz3k3',
    },
  }, // Invalid relationshipType
  {
    VerificationRelationship: {
      id: `${VALID_DID}#key-1`,
      type: 'Ed25519VerificationKey2020',
      relationshipType: 123,
      controller: VALID_DID,
      publicKeyMultibase: 'z6Mkq8X7Q7Jz3k3',
    },
  }, // Invalid relationshipType
  {
    VerificationRelationship: {
      id: `${VALID_DID}#key-1`,
      type: 'Ed25519VerificationKey2020',
      relationshipType: 'authentication',
      publicKeyMultibase: 'z6Mkq8X7Q7Jz3k3',
    },
  }, // Missing controller
  {
    VerificationRelationship: {
      id: `${VALID_DID}#key-1`,
      type: 'Ed25519VerificationKey2020',
      relationshipType: 'authentication',
      controller: 'invalid',
      publicKeyMultibase: 'z6Mkq8X7Q7Jz3k3',
    },
  }, // Invalid controller
  {
    VerificationRelationship: {
      id: `${VALID_DID}#key-1`,
      type: 'Ed25519VerificationKey2020',
      relationshipType: 'authentication',
      controller: 123,
      publicKeyMultibase: 'z6Mkq8X7Q7Jz3k3',
    },
  }, // Invalid controller
  {
    VerificationRelationship: {
      id: `${VALID_DID}#key-1`,
      type: 'Ed25519VerificationKey2020',
      relationshipType: 'authentication',
      controller: VALID_DID,
    },
  }, // Missing publicKeyMultibase and publicKeyBase58
  {
    VerificationRelationship: {
      id: `${VALID_DID}#key-1`,
      type: 'Ed25519VerificationKey2020',
      relationshipType: 'authentication',
      controller: VALID_DID,
      publicKeyMultibase: 123,
    },
  }, // Invalid publicKeyMultibase
  {
    VerificationRelationship: {
      id: `${VALID_DID}#key-1`,
      type: 'Ed25519VerificationKey2020',
      relationshipType: 'authentication',
      controller: VALID_DID,
      publicKeyBase58: 123,
    },
  }, // Invalid publicKeyBase58
  'invalid', // Invalid type
  {
    VerificationRelationship: 'invalid',
  }, // Invalid VerificationRelationship
];

describe('isAddVerificationRelationshipEvent validator', () => {
  it.each(VALID)(
    'should return true for valid AddVerificationRelationshipMethodEvent',
    (eventObject) => {
      expect(isAddVerificationRelationshipEvent(eventObject)).toBe(true);
    },
  );

  it.each(INVALID)(
    'should return false for invalid AddVerificationRelationshipMethodEvent',
    (eventObject) => {
      expect(isAddVerificationRelationshipEvent(eventObject)).toBe(false);
    },
  );
});
