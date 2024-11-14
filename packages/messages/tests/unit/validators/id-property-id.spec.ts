import { isPropertyID } from '../../../src/validators/id-property-id';

describe('Is property ID validator', () => {
  it.each(['#key-1', '#key-123', '#key', '#12-key', '#any-string'])(
    'should return true for valid property ID [%s]',
    (propertyId) => {
      expect(isPropertyID(propertyId)).toBeTruthy();
    },
  );

  it.each(['', '...', '#', '#.', '#.key', 'key'])(
    'should return false for invalid property ID [%s]',
    (propertyId) => {
      expect(isPropertyID(propertyId)).toBeFalsy();
    },
  );
});
