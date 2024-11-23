import { isObject } from './base';
import { DIDEvent } from '../interfaces/did-event';
import { isDIDOwnerEvent } from './is-did-owner-event';
import { isAddVerificationMethodEvent } from './is-add-verification-method-event';
import { isRemoveVerificationMethodEvent } from './is-remove-verification-method-event';
import { isAddVerificationRelationshipEvent } from './is-add-verification-relationship-event';
import { isRemoveVerificationRelationshipEvent } from './is-remove-verification-relationship-event';
import { isAddServiceEvent } from './is-add-service-event';
import { isRemoveServiceEvent } from './is-remove-service-event';

/**
 * Check if the event in DID message is a valid Hedera DID message event
 * @param eventObject The event object to check
 * @returns True if the event is a valid Hedera DID message event, false otherwise
 */
export function isDIDMessageEvent(
  eventObject: unknown,
): eventObject is DIDEvent {
  if (!isObject(eventObject)) {
    return false;
  }

  const eventSpecificValidators = [
    isDIDOwnerEvent,
    isAddVerificationMethodEvent,
    isRemoveVerificationMethodEvent,
    isAddVerificationRelationshipEvent,
    isRemoveVerificationRelationshipEvent,
    isAddServiceEvent,
    isRemoveServiceEvent,
  ];

  return eventSpecificValidators.some((validator) => validator(eventObject));
}
