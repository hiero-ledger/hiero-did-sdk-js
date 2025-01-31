import { DIDMessage } from '@swiss-digital-assets-institute/core';
import { DIDUpdateOperationsKeys } from '../interface';
import { DIDError } from '@swiss-digital-assets-institute/core';

/**
 * Extracts the operation type from the DID message.
 */
export function extractOperation({
  operation,
  message,
}: DIDMessage): DIDUpdateOperationsKeys {
  const encodedEvent = message['event'];

  if (!encodedEvent || typeof encodedEvent !== 'string') {
    throw new DIDError('internalError', 'Invalid DID message');
  }

  const decodedEvent: object = JSON.parse(
    Buffer.from(encodedEvent, 'base64').toString('utf-8'),
  );

  const isService = 'Service' in decodedEvent;
  const isVerificationMethod =
    'VerificationMethod' in decodedEvent ||
    'VerificationRelationship' in decodedEvent;

  if (operation === 'update' && isService) {
    return 'add-service';
  }

  if (operation === 'update' && isVerificationMethod) {
    return 'add-verification-method';
  }

  if (operation === 'revoke' && isService) {
    return 'remove-service';
  }

  if (operation === 'revoke' && isVerificationMethod) {
    return 'remove-verification-method';
  }

  throw new DIDError('internalError', 'Invalid DID message operation');
}
