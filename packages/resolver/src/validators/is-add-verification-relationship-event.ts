import { AddVerificationRelationshipMethodEvent } from '../interfaces/add-verification-relationship-method-event';
import { hasVerificationMethodProperties, isObject, isString } from './base';

/**
 * Check if the given object is a VerificationRelationship event according to the Hedera DID Method specification
 * {@link https://github.com/hashgraph/did-method/blob/master/hedera-did-method-specification.md#324-verification-relationship}
 * @param eventObject The object to check
 * @returns True if the object is a AddVerificationRelationshipMethodEvent, false otherwise
 */
export function isAddVerificationRelationshipEvent(
  eventObject: unknown
): eventObject is AddVerificationRelationshipMethodEvent {
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

  if (!hasVerificationMethodProperties(VerificationRelationship)) {
    return false;
  }

  if (
    !('relationshipType' in VerificationRelationship) ||
    !isString(VerificationRelationship.relationshipType) ||
    !['authentication', 'assertionMethod', 'keyAgreement', 'capabilityInvocation', 'capabilityDelegation'].includes(
      VerificationRelationship.relationshipType
    )
  ) {
    return false;
  }

  return true;
}
