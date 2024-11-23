import { isRemoveVerificationRelationshipEvent } from '../../src/validators/is-remove-verification-relationship-event';
import { VALID_DID } from '../helpers';

export const VALID = [
  {
    VerificationRelationship: {
      id: `${VALID_DID}#service-1`,
    },
  },
];

export const INVALID = [
  {
    id: `${VALID_DID}#service-1`,
  }, // Missing VerificationRelationship key
  {
    VerificationRelationship: {
      id: 'invalid',
    },
  }, // Invalid id
  {
    VerificationRelationship: {},
  }, // Missing id
  'invalid', // Invalid type
  {
    VerificationRelationship: 'invalid',
  }, // Invalid VerificationRelationship
];

describe('isRemoveVerificationRelationshipEvent validator', () => {
  it.each(VALID)(
    'should return true for valid RemoveVerificationRelationshipMethodEvent',
    (eventObject) => {
      expect(isRemoveVerificationRelationshipEvent(eventObject)).toBe(true);
    },
  );

  it.each(INVALID)(
    'should return false for invalid RemoveVerificationRelationshipMethodEvent',
    (eventObject) => {
      expect(isRemoveVerificationRelationshipEvent(eventObject)).toBe(false);
    },
  );
});
