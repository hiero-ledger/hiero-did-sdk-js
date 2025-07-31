import { isHederaDID, isHederaDIDUrl } from '@hiero-did-sdk/core';

export function isString(value: unknown): value is string {
  if (!value) return false;
  return typeof value === 'string';
}

export function isObject(value: unknown): value is object {
  if (!value) return false;
  return typeof value === 'object';
}

/**
 * Check if the given object has the properties of a VerificationMethod according to the Hedera DID Method specification
 * @param eventObject The object to check
 * @returns True if the object has the properties of a VerificationMethod, false otherwise
 */
export function hasVerificationMethodProperties(eventObject: unknown): boolean {
  if (!isObject(eventObject)) {
    return false;
  }

  if (!('id' in eventObject) || !isString(eventObject.id) || !isHederaDIDUrl(eventObject.id)) {
    return false;
  }

  if (!('type' in eventObject) || !isString(eventObject.type)) {
    return false;
  }

  if (!('controller' in eventObject) || !isString(eventObject.controller) || !isHederaDID(eventObject.controller)) {
    return false;
  }

  if ('publicKeyMultibase' in eventObject) {
    if (!isString(eventObject.publicKeyMultibase)) {
      return false;
    }
  }

  if ('publicKeyBase58' in eventObject) {
    if (!isString(eventObject.publicKeyBase58)) {
      return false;
    }
  }

  if (!('publicKeyMultibase' in eventObject) && !('publicKeyBase58' in eventObject)) {
    return false;
  }

  return true;
}
