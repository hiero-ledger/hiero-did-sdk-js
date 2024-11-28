import { isHederaDIDUrl } from '@swiss-digital-assets-institute/core';
import { RemoveVerificationMethodEvent } from '../interfaces/remove-verification-method-event';
import { isObject, isString } from './base';

/**
 * Check if the given object is a VerificationMethod event according to the Hedera DID Method specification
 * {@link https://github.com/hashgraph/did-method/blob/master/hedera-did-method-specification.md#323-verification-method}
 * @param eventObject The object to check
 * @returns True if the object is a RemoveVerificationMethodEvent, false otherwise
 */
export function isRemoveVerificationMethodEvent(
  eventObject: unknown,
): eventObject is RemoveVerificationMethodEvent {
  if (!isObject(eventObject)) {
    return false;
  }

  if (!('VerificationMethod' in eventObject)) {
    return false;
  }

  const { VerificationMethod } = eventObject;

  if (!isObject(VerificationMethod)) {
    return false;
  }

  if (
    !('id' in VerificationMethod) ||
    !isString(VerificationMethod.id) ||
    !isHederaDIDUrl(VerificationMethod.id)
  ) {
    return false;
  }

  return true;
}
