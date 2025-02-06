import { DIDMessage, DIDError } from '@swiss-digital-assets-institute/core';
import { DIDUpdateOperationsKeys } from '../interface';
import { OperationState } from '../../interfaces';
import {
  DIDAddServiceMessage,
  DIDAddVerificationMethodMessage,
  DIDRemoveServiceMessage,
  DIDRemoveVerificationMethodMessage,
} from '@swiss-digital-assets-institute/messages';
import { RunnerState } from '@swiss-digital-assets-institute/lifecycle';

interface DeserializedState extends RunnerState<DIDMessage> {
  operation: DIDUpdateOperationsKeys;
}

/**
 * Deserializes the array of state messages to the operation state.
 */
export function deserializeState(
  states: OperationState[],
): DeserializedState[] {
  try {
    return states.map((state) => {
      const encodedMessage = state.message;
      const messageObject = JSON.parse(
        Buffer.from(encodedMessage, 'base64').toString('utf8'),
      );

      let message: DIDMessage;
      let operation: DIDUpdateOperationsKeys;
      if (
        'property' in messageObject &&
        'id' in messageObject &&
        'publicKeyMultibase' in messageObject
      ) {
        message = DIDAddVerificationMethodMessage.fromBytes(encodedMessage);
        operation = 'add-verification-method';
      }

      if ('property' in messageObject && 'id' in messageObject && !message) {
        message = DIDRemoveVerificationMethodMessage.fromBytes(encodedMessage);
        operation = 'remove-verification-method';
      }

      if ('serviceEndpoint' in messageObject && !message) {
        message = DIDAddServiceMessage.fromBytes(encodedMessage);
        operation = 'add-service';
      }

      if ('id' in messageObject && !message) {
        message = DIDRemoveServiceMessage.fromBytes(encodedMessage);
        operation = 'remove-service';
      }

      return {
        ...state,
        message,
        operation,
      };
    });
  } catch {
    throw new DIDError('internalError', 'Invalid state of the operation');
  }
}
