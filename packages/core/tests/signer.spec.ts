import { PublicKey, Transaction } from '@hiero-ledger/sdk';
import { KeysUtility, Signer } from '@hiero-did-sdk/core';

describe('signer', () => {
  const mockPublicKeyDer = 'mock-public-key-der';

  const mockPublicKey = {} as PublicKey;

  const mockTransaction = {
    signWith: vi.fn().mockReturnThis(),
  } as unknown as Transaction;

  const mockKeysUtility = {
    toPublicKey: vi.fn().mockReturnValue(mockPublicKey),
  };

  // Create a mock signer with the original publicKeyInstance implementation
  const mockSigner = new (class extends Signer {
    publicKey = vi.fn().mockResolvedValue(mockPublicKeyDer);
    sign = vi.fn();
    verify = vi.fn().mockResolvedValue(true);
  })();

  vi.spyOn(KeysUtility, 'fromDerString').mockReturnValue(mockKeysUtility as unknown as KeysUtility);

  describe('publicKeyInstance', () => {
    it('should return a PublicKey from a Signer', async () => {
      const result = await mockSigner.publicKeyInstance();

      expect(mockSigner.publicKey).toHaveBeenCalledTimes(1);
      expect(KeysUtility.fromDerString).toHaveBeenCalledWith(mockPublicKeyDer);
      expect(mockKeysUtility.toPublicKey).toHaveBeenCalledTimes(1);
      expect(result).toBe(mockPublicKey);
    });

    it('should throw an error if signer.publicKey fails', async () => {
      const mockError = new Error('Failed to get public key');

      // Mock the publicKey method to reject with mockError
      vi.spyOn(mockSigner, 'publicKey').mockRejectedValueOnce(mockError);

      await expect(mockSigner.publicKeyInstance()).rejects.toThrow(mockError);
      expect(mockSigner.publicKey).toHaveBeenCalledTimes(1);
    });
  });

  describe('signTransaction', () => {
    it('should sign a transaction with the signer', async () => {
      // Mock the publicKeyInstance method to return the mock public key
      vi.spyOn(mockSigner, 'publicKeyInstance').mockResolvedValueOnce(mockPublicKey);

      const result = await mockSigner.signTransaction(mockTransaction);

      expect(mockSigner.publicKeyInstance).toHaveBeenCalledTimes(1);
      expect(mockTransaction.signWith).toHaveBeenCalledWith(mockPublicKey, expect.any(Function));
      expect(result).toBe(mockTransaction);
    });

    it('should throw an error if signer.publicKey fails', async () => {
      const mockError = new Error('Failed to get public key');

      // Mock the publicKey method to reject with mockError
      vi.spyOn(mockSigner, 'publicKey').mockRejectedValueOnce(mockError);

      await expect(mockSigner.signTransaction(mockTransaction)).rejects.toThrow();

      expect(mockSigner.publicKey).toHaveBeenCalledTimes(1);
    });

    it('should call the sign function with the payload when signing the transaction', async () => {
      const mockPayload = new Uint8Array([4, 5, 6]);
      let capturedSignFunction: ((payload: Uint8Array) => Promise<Uint8Array>) | undefined;

      const mockTransaction = {
        signWith: vi.fn().mockImplementation((publicKey, signFunction) => {
          capturedSignFunction = signFunction;
          return mockTransaction;
        }),
      } as unknown as Transaction;

      // Mock the sign method to return the mock signed payload
      vi.spyOn(mockSigner, 'sign').mockResolvedValueOnce(new Uint8Array([1, 2, 3]));

      // Mock the publicKeyInstance method to return the mock public key
      vi.spyOn(mockSigner, 'publicKeyInstance').mockResolvedValueOnce(mockPublicKey);

      await mockSigner.signTransaction(mockTransaction);

      expect(mockTransaction.signWith).toHaveBeenCalledWith(mockPublicKey, expect.any(Function));
      expect(capturedSignFunction).toBeDefined();
      if (capturedSignFunction) {
        await capturedSignFunction(mockPayload);
        expect(mockSigner.sign).toHaveBeenCalledWith(mockPayload);
      }
    });
  });
});
