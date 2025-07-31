import { AddVerificationMethodEvent } from '../interfaces/add-verification-method-event';
import { hasVerificationMethodProperties, isObject } from './base';

/**
 * Check if the given object is a VerificationMethod event according to the Hedera DID Method specification
 * {@link https://github.com/hashgraph/did-method/blob/master/hedera-did-method-specification.md#323-verification-method}
 * @param eventObject The object to check
 * @returns True if the object is a AddVerificationMethodEvent, false otherwise
 */
export function isAddVerificationMethodEvent(eventObject: unknown): eventObject is AddVerificationMethodEvent {
  if (!isObject(eventObject)) {
    return false;
  }

  if (!('VerificationMethod' in eventObject)) {
    return false;
  }

  const { VerificationMethod } = eventObject;

  return hasVerificationMethodProperties(VerificationMethod);
}
