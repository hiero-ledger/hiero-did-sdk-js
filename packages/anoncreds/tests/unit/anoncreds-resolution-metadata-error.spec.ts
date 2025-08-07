import { AnonCredsResolutionMetadataError } from '../../src/dto';

describe('AnonCredsResolutionMetadataError', () => {
  it('should create an instance with error and message', () => {
    const errorString = 'SomeError';
    const messageString = 'This is the error message';
    const errorInstance = new AnonCredsResolutionMetadataError(errorString, messageString);

    expect(errorInstance).toBeInstanceOf(Error);
    expect(errorInstance).toBeInstanceOf(AnonCredsResolutionMetadataError);
    expect(errorInstance.error).toBe(errorString);
    expect(errorInstance.message).toBe(messageString);
    expect(errorInstance.name).toBe('Error');
  });
});
