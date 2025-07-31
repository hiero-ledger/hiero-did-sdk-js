import { isHederaDID } from '@hiero-did-sdk/core';
import { DIDOwnerEvent } from '../interfaces/did-owner-event';
import { hasVerificationMethodProperties, isObject, isString } from './base';

/**
 * Check if the given object is a DIDOwner event according to the Hedera DID Method specification
 * {@link https://github.com/hashgraph/did-method/blob/master/hedera-did-method-specification.md#322-did-owner}
 * @param eventObject The object to check
 * @returns True if the object is a DIDOwnerEvent, false otherwise
 */
export function isDIDOwnerEvent(eventObject: unknown): eventObject is DIDOwnerEvent {
  if (!isObject(eventObject)) {
    return false;
  }

  if (!('DIDOwner' in eventObject)) {
    return false;
  }

  const { DIDOwner } = eventObject;

  if (!isObject(DIDOwner)) {
    return false;
  }

  if (!('id' in DIDOwner) || !isString(DIDOwner.id) || !isHederaDID(DIDOwner.id)) {
    return false;
  }

  return hasVerificationMethodProperties(DIDOwner);
}
