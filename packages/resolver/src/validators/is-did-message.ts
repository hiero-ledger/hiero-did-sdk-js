import { isHederaDID } from '@hashgraph-did-sdk/core';
import { TopicDIDContent } from '../interfaces/topic-did-message';
import { isObject, isString } from './base';

/**
 * Check if the message object is a DID message.
 * @param messageObject The message object to check
 * @returns True if the message object is a DID message, false otherwise
 */
export function isDIDMessage(
  messageObject: unknown,
): messageObject is TopicDIDContent {
  if (!isObject(messageObject)) {
    return false;
  }

  if (!('message' in messageObject)) {
    return false;
  }

  if (!('signature' in messageObject)) {
    return false;
  }

  const { message, signature } = messageObject;

  if (!isString(signature)) {
    return false;
  }

  if (!isObject(message)) {
    return false;
  }

  if (!('timestamp' in message) || !isString(message.timestamp)) {
    return false;
  }

  if (
    !('operation' in message) ||
    !isString(message.operation) ||
    !['create', 'update', 'delete', 'revoke'].includes(message.operation)
  ) {
    return false;
  }

  if (
    !('did' in message) ||
    !isString(message.did) ||
    !isHederaDID(message.did)
  ) {
    return false;
  }

  if (
    message.operation !== 'delete' &&
    (!('event' in message) || !isString(message.event))
  ) {
    return false;
  }

  if (
    message.operation === 'delete' &&
    (!('event' in message) || message.event !== null)
  ) {
    return false;
  }

  return true;
}
