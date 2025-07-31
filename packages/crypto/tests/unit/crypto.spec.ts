import { Crypto } from '@hiero-did-sdk/crypto';
import { Buffer } from 'buffer';

const data = 'Test data for sha256 calculating';
const digest = '952a959a1ac6cd9ce1d80fcd1dfd570401c0d40ab36ea9a7a2e22295fd630d3b';

const engines = [{ name: 'crypto' }, { name: 'react-native-quick-crypto' }];

describe('Crypto', () => {
  const mockCreateHash = jest.fn().mockReturnThis();
  const mockUpdate = jest.fn().mockReturnThis();
  const mockDigest = jest.fn().mockReturnValue(digest);
  const cryptoMock = {
    createHash: mockCreateHash,
    update: mockUpdate,
    digest: mockDigest,
  };

  beforeEach(() => {
    jest.mock('crypto', () => undefined);
    jest.mock('react-native-quick-crypto', () => undefined, { virtual: true });
    jest.resetModules();
  });

  it('should throw an error if no compatible crypto module is found', () => {
    // Mock failure for all crypto modules
    jest.mock('crypto', () => {
      throw new Error();
    });
    jest.mock(
      'react-native-quick-crypto',
      () => {
        throw new Error();
      },
      { virtual: true }
    );

    expect(() => Crypto.sha256(data)).toThrow('No compatible crypto module found');
  });

  it('should handle different types of HashInput', () => {
    jest.mock('crypto', () => cryptoMock);
    jest.resetModules();

    const stringInput = data;
    const arrayBufferInput = new TextEncoder().encode(data).buffer;
    const uint8ArrayInput = new Uint8Array(arrayBufferInput);
    const bufferInput: Buffer = Buffer.from(data);

    expect(Crypto.sha256(stringInput)).toBe(digest);
    expect(Crypto.sha256(arrayBufferInput)).toBe(digest);
    expect(Crypto.sha256(uint8ArrayInput)).toBe(digest);
    expect(Crypto.sha256(bufferInput)).toBe(digest);

    expect(mockUpdate).toHaveBeenCalledWith(bufferInput);
  });

  it.each(engines)('should hash a string input correctly using $name', ({ name }) => {
    jest.mock(name, () => cryptoMock);
    jest.resetModules();

    let result = Crypto.sha256(data);
    expect(result).toBe(digest);

    result = Crypto.sha256(Buffer.from(data));
    expect(result).toBe(digest);

    expect(mockCreateHash).toHaveBeenCalledWith('sha256');
  });
});
