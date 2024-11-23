import { isHederaDIDUrl } from '@hashgraph-did-sdk/core';
import { isObject, isString } from './base';
import { AddServiceEvent } from '../interfaces/add-service-event';

/**
 * Check if the given object is a Service event according to the Hedera DID Method specification
 * {@link https://github.com/hashgraph/did-method/blob/master/hedera-did-method-specification.md#325-services}
 * @param eventObject The object to check
 * @returns True if the object is a AddServiceEvent, false otherwise
 */
export function isAddServiceEvent(
  eventObject: unknown,
): eventObject is AddServiceEvent {
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

  if (!('type' in Service) || !isString(Service.type)) {
    return false;
  }

  if (!('serviceEndpoint' in Service) || !isString(Service.serviceEndpoint)) {
    return false;
  }

  return true;
}
