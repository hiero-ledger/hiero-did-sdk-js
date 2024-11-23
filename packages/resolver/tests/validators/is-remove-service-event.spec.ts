import { isRemoveServiceEvent } from '../../src/validators/is-remove-service-event';
import { VALID_DID } from '../helpers';

export const VALID = [
  {
    Service: {
      id: `${VALID_DID}#service-1`,
    },
  },
];

export const INVALID = [
  {
    id: `${VALID_DID}#service-1`,
  }, // Missing Service key
  {
    Service: {
      id: 'invalid',
    },
  }, // Invalid id
  {
    Service: {},
  }, // Missing id
  'invalid', // Invalid type
  {
    Service: 'invalid',
  }, // Invalid Service
];

describe('isRemoveServiceEvent validator', () => {
  it.each(VALID)(
    'should return true for valid RemoveServiceEvent',
    (eventObject) => {
      expect(isRemoveServiceEvent(eventObject)).toBe(true);
    },
  );

  it.each(INVALID)(
    'should return false for invalid RemoveServiceEvent',
    (eventObject) => {
      expect(isRemoveServiceEvent(eventObject)).toBe(false);
    },
  );
});
