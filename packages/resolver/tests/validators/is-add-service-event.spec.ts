import { isAddServiceEvent } from '../../src/validators/is-add-service-event';
import { VALID_DID } from '../helpers';

export const VALID = [
  {
    Service: {
      id: `${VALID_DID}#service-1`,
      type: 'VerifiableCredentialService',
      serviceEndpoint: 'https://example.com/credentials',
    },
  },
];

export const INVALID = [
  {
    id: `${VALID_DID}#service-1`,
    type: 'VerifiableCredentialService',
    serviceEndpoint: 'https://example.com/credentials',
  }, // Missing Service key
  {
    Service: {
      id: 'invalid',
      type: 'VerifiableCredentialService',
      serviceEndpoint: 'https://example.com/credentials',
    },
  }, // Invalid id
  {
    Service: {
      type: 'VerifiableCredentialService',
      serviceEndpoint: 'https://example.com/credentials',
    },
  }, // Missing id
  {
    Service: {
      id: `${VALID_DID}#service-1`,
      serviceEndpoint: 'https://example.com/credentials',
    },
  }, // Missing type
  {
    Service: {
      id: `${VALID_DID}#service-1`,
      type: 'VerifiableCredentialService',
    },
  }, // Missing serviceEndpoint
  {
    Service: {
      id: `${VALID_DID}#service-1`,
      type: 123,
      serviceEndpoint: 'https://example.com/credentials',
    },
  }, // Invalid type
  {
    Service: {
      id: `${VALID_DID}#service-1`,
      type: 'VerifiableCredentialService',
      serviceEndpoint: 123,
    },
  }, // Invalid serviceEndpoint
  {
    Service: {
      id: `${VALID_DID}#service-1`,
      type: {},
      serviceEndpoint: {},
    }, // Invalid type and serviceEndpoint
  },
  'invalid', // Invalid type
  {
    Service: 'invalid', // Invalid Service
  },
];

describe('isAddServiceEvent validator', () => {
  it.each(VALID)(
    'should return true for valid AddServiceEvent',
    (eventObject) => {
      expect(isAddServiceEvent(eventObject)).toBe(true);
    },
  );

  it.each(INVALID)(
    'should return false for invalid AddServiceEvent',
    (eventObject) => {
      expect(isAddServiceEvent(eventObject)).toBe(false);
    },
  );
});
