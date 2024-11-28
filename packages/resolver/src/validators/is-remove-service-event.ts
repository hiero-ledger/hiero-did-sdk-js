import { isHederaDIDUrl } from '@swiss-digital-assets-institute/core';
import { RemoveServiceEvent } from '../interfaces/remove-service-event';
import { isObject, isString } from './base';

/**
 * Check if the given object is a Service event according to the Hedera DID Method specification
 * {@link https://github.com/hashgraph/did-method/blob/master/hedera-did-method-specification.md#325-services}
 * @param eventObject The object to check
 * @returns True if the object is a RemoveServiceEvent, false otherwise
 */
export function isRemoveServiceEvent(
  eventObject: unknown,
): eventObject is RemoveServiceEvent {
  if (!isObject(eventObject)) {
    return false;
  }

  if (!('Service' in eventObject)) {
    return false;
  }

  const { Service } = eventObject;

  if (!isObject(Service)) {
    return false;
  }

  if (
    !('id' in Service) ||
    !isString(Service.id) ||
    !isHederaDIDUrl(Service.id)
  ) {
    return false;
  }

  return true;
}
