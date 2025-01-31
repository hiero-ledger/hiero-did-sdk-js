import { DIDMessage } from '@swiss-digital-assets-institute/core';
import { extractOperation } from '../../src/update-did/helpers/extract-operation';

describe('Extract operation', () => {
  const createMessage = (event: object, operation: string): DIDMessage =>
    ({
      operation,
      message: {
        event: Buffer.from(JSON.stringify(event)).toString('base64'),
      },
    }) as never;

  it('should throw an error if the message is invalid', () => {
    expect(() =>
      extractOperation({ operation: 'update', message: {} } as never),
    ).toThrow('Invalid DID message');
  });

  it('should throw an error if the message event is invalid', () => {
    expect(() =>
      extractOperation({
        operation: 'update',
        message: { event: { foo: 'bar' } },
      } as never),
    ).toThrow('Invalid DID message');
  });

  it('should identify add service operation', () => {
    const message = createMessage({ Service: {} }, 'update');

    expect(extractOperation(message)).toBe('add-service');
  });

  it('should identify add verification method operation', () => {
    const message = createMessage({ VerificationMethod: {} }, 'update');

    expect(extractOperation(message)).toBe('add-verification-method');
  });

  it('should identify remove service operation', () => {
    const message = createMessage({ Service: {} }, 'revoke');

    expect(extractOperation(message)).toBe('remove-service');
  });

  it('should identify remove verification method operation', () => {
    const message = createMessage({ VerificationMethod: {} }, 'revoke');

    expect(extractOperation(message)).toBe('remove-verification-method');
  });

  it('should throw an error if the operation is invalid', () => {
    const message = createMessage({ VerificationMethod: {} }, 'invalid');

    expect(() => extractOperation(message)).toThrow(
      'Invalid DID message operation',
    );
  });
});
