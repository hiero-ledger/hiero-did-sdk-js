import { isDIDMessageEvent } from '../../src/validators/is-did-message-event';
import { VALID as VALID_SERVICE_ADD_EVENT } from './is-add-service-event.spec';
import { VALID as VALID_VM_ADD_EVENT } from './is-add-verification-method-event.spec';
import { VALID as VALID_VR_ADD_EVENT } from './is-add-verification-relationship-event.spec';
import { VALID as VALID_SERVICE_REMOVE_EVENT } from './is-remove-service-event.spec';
import { VALID as VALID_VM_REMOVE_EVENT } from './is-remove-verification-method-event.spec';
import { VALID as VALID_VR_REMOVE_EVENT } from './is-remove-verification-relationship-event.spec';

const VALID = [
  ...VALID_SERVICE_ADD_EVENT,
  ...VALID_VM_ADD_EVENT,
  ...VALID_VR_ADD_EVENT,
  ...VALID_SERVICE_REMOVE_EVENT,
  ...VALID_VM_REMOVE_EVENT,
  ...VALID_VR_REMOVE_EVENT,
];

describe('isDIDMessageEvent validator', () => {
  it.each(VALID)('should return true for valid DIDEvent', (eventObject) => {
    expect(isDIDMessageEvent(eventObject)).toBe(true);
  });

  it.each([{}, { foo: 'bar' }, '{}', 'string', null, false, true])(
    'should return false for invalid DIDEvent',
    (eventObject) => {
      expect(isDIDMessageEvent(eventObject)).toBe(false);
    },
  );
});
