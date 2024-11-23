import { isHederaDIDUrl } from '@hashgraph-did-sdk/core';
import { RemoveVerificationRelationshipMethodEvent } from '../interfaces/remove-verification-relationship-method-event';
import { isObject, isString } from './base';

/**
 * Check if the given object is a VerificationRelationship event according to the Hedera DID Method specification
 * {@link https://github.com/hashgraph/did-method/blob/master/hedera-did-method-specification.md#324-verification-relationship}
 * @param eventObject The object to check
 * @returns True if the object is a RemoveVerificationRelationshipMethodEvent, false otherwise
 */
export function isRemoveVerificationRelationshipEvent(
  eventObject: unknown,
): eventObject is RemoveVerificationRelationshipMethodEvent {
  if (!isObject(eventObject)) {
    return false;
  }

  if (!('VerificationRelationship' in eventObject)) {
    return false;
  }

  const { VerificationRelationship } = eventObject;

  if (!isObject(VerificationRelationship)) {
    return false;
  }

  if (
    !('id' in VerificationRelationship) ||
    !isString(VerificationRelationship.id) ||
    !isHederaDIDUrl(VerificationRelationship.id)
  ) {
    return false;
  }

  return true;
}
