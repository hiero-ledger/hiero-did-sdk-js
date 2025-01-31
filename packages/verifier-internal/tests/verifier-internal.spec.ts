import { PrivateKey } from '@hashgraph/sdk';
import { KeysUtility } from '@swiss-digital-assets-institute/core';
import { Verifier } from '../src';

describe('Internal Verifier class', () => {
  let privateKey: PrivateKey;

  beforeAll(async () => {
    privateKey = await PrivateKey.generateED25519Async();
  });

  describe('initializing a verifier', () => {
    it('should initialize with ed25519 public key', () => {
      const verifier = new Verifier(privateKey.publicKey);

      expect(verifier.verifierKey).toStrictEqual(privateKey.publicKey);
    });

    it('should initialize from multibase', () => {
      const keyUtil = KeysUtility.fromPublicKey(privateKey.publicKey);
      const verifier = Verifier.fromMultibase(keyUtil.toMultibase());

      expect(verifier.verifierKey).toStrictEqual(privateKey.publicKey);
    });

    it('should initialize from base58', () => {
      const keyUtil = KeysUtility.fromPublicKey(privateKey.publicKey);
      const verifier = Verifier.fromBase58(keyUtil.toBase58());

      expect(verifier.verifierKey).toStrictEqual(privateKey.publicKey);
    });

    it('should throw an error if the public key is not ED25519', async () => {
      const privateKey = await PrivateKey.generateECDSAAsync();
      expect(() => new Verifier(privateKey.publicKey)).toThrow(
        'Invalid public key type. Expected ED25519.',
      );
    });
  });

  describe('getting the public key', () => {
    it('should return the matching public key', () => {
      const verifier = new Verifier(privateKey.publicKey);

      const publicKey = verifier.publicKey();

      expect(publicKey).toBe(privateKey.publicKey.toStringDer());
    });
  });

  describe('verifying a message', () => {
    it('should verify a valid signature', () => {
      const verifier = new Verifier(privateKey.publicKey);

      const message = Buffer.from('Hello, Hedera!');
      const signature = privateKey.sign(message);

      const isValid = verifier.verify(message, signature);

      expect(isValid).toBe(true);
    });

    it('should not verify an invalid signature', () => {
      const verifier = new Verifier(privateKey.publicKey);

      const message = Buffer.from('Hello, Hedera!');
      const signature = privateKey.sign(message);

      const tamperedMessage = Buffer.from('Hello, Hedera?');

      const isValid = verifier.verify(tamperedMessage, signature);

      expect(isValid).toBe(false);
    });
  });
});
