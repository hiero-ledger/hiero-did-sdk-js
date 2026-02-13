 
import { Crypto } from '@hiero-did-sdk/crypto';
import { Buffer } from 'buffer';
import * as nodeModule from '../../src/node-crypto';
import * as rnModule from '../../src/react-native-crypto';
import { vi } from 'vitest';

const data = 'Test data for sha256 calculating';
const digest = '952a959a1ac6cd9ce1d80fcd1dfd570401c0d40ab36ea9a7a2e22295fd630d3b';
const engines = ['crypto', 'react-native-quick-crypto'] as const;

describe('Crypto', () => {
  let mockUpdate;
  let mockCreateHash;
  let cryptoMock;

  beforeEach(() => {
    // Re-initialize mocks for every test to reset call counts
    mockUpdate = vi.fn().mockReturnThis();
    const mockDigest = vi.fn().mockReturnValue(digest);

    // The hash object returned by createHash
    const hashObject = {
      update: mockUpdate,
      digest: mockDigest,
    };

    mockCreateHash = vi.fn().mockReturnValue(hashObject);

    cryptoMock = {
      createHash: mockCreateHash,
    };
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('should throw an error if no compatible crypto module is found', () => {
    // Force both to be undefined via getters
    vi.spyOn(nodeModule, 'nodeCrypto', 'get').mockReturnValue(undefined);
    vi.spyOn(rnModule, 'rnCrypto', 'get').mockReturnValue(undefined);

    expect(() => Crypto.sha256(data)).toThrow('No compatible crypto module found');
  });

  it('should handle different types of HashInput', () => {
    vi.spyOn(nodeModule, 'nodeCrypto', 'get').mockReturnValue(cryptoMock);
    vi.spyOn(rnModule, 'rnCrypto', 'get').mockReturnValue(undefined);

    const stringInput = data;
    const arrayBufferInput = new TextEncoder().encode(data).buffer;
    const uint8ArrayInput = new Uint8Array(arrayBufferInput);
    const bufferInput: Buffer = Buffer.from(data);

    expect(Crypto.sha256(stringInput)).toBe(digest);
    expect(Crypto.sha256(arrayBufferInput)).toBe(digest);
    expect(Crypto.sha256(uint8ArrayInput)).toBe(digest);
    expect(Crypto.sha256(bufferInput)).toBe(digest);

    // We check for Uint8Array because the SDK normalizes inputs
    // to Uint8Array before passing them to the engine
    expect(mockUpdate).toHaveBeenCalledWith(bufferInput);
  });

  it.each(engines)('should hash a string input correctly using %s', (engine) => {
    if (engine === 'crypto') {
      vi.spyOn(nodeModule, 'nodeCrypto', 'get').mockReturnValue(cryptoMock);
      vi.spyOn(rnModule, 'rnCrypto', 'get').mockReturnValue(undefined);
    } else {
      vi.spyOn(nodeModule, 'nodeCrypto', 'get').mockReturnValue(undefined);
      vi.spyOn(rnModule, 'rnCrypto', 'get').mockReturnValue(cryptoMock);
    }

    let result = Crypto.sha256(data);
    expect(result).toBe(digest);

    result = Crypto.sha256(Buffer.from(data));
    expect(result).toBe(digest);

    expect(mockCreateHash).toHaveBeenCalledWith('sha256');
  });
});
