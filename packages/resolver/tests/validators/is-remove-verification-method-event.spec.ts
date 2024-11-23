import { isRemoveVerificationMethodEvent } from '../../src/validators/is-remove-verification-method-event';
import { VALID_DID } from '../helpers';

export const VALID = [
  {
    VerificationMethod: {
      id: `${VALID_DID}#service-1`,
    },
  },
];

export const INVALID = [
  {
    id: `${VALID_DID}#service-1`,
  }, // Missing VerificationMethod key
  {
    VerificationMethod: {
      id: 'invalid',
    },
  }, // Invalid id
  {
    VerificationMethod: {},
  }, // Missing id
  'invalid', // Invalid type
  {
    VerificationMethod: 'invalid',
  }, // Invalid VerificationMethod
];

describe('isRemoveVerificationMethodEvent validator', () => {
  it.each(VALID)(
    'should return true for valid RemoveVerificationMethodEvent',
    (eventObject) => {
      expect(isRemoveVerificationMethodEvent(eventObject)).toBe(true);
    },
  );

  it.each(INVALID)(
    'should return false for invalid RemoveVerificationMethodEvent',
    (eventObject) => {
      expect(isRemoveVerificationMethodEvent(eventObject)).toBe(false);
    },
  );
});
