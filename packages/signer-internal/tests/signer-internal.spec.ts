import { PrivateKey } from '@hashgraph/sdk';
import { InternalSigner } from '../src';

describe('Internal signer class', () => {
  describe('initializing a signer', () => {
    it('should generate a new ED25519 key pair', () => {
      const signer = InternalSigner.generate();

      expect(signer.privateKey).toBeInstanceOf(PrivateKey);
      expect(signer.privateKey.type).toBe('ED25519');
    });

    it('should accept a ED25519 private key as a parameter', () => {
      const privateKey = PrivateKey.generateED25519();
      const signer = new InternalSigner(privateKey);

      expect(signer.privateKey).toBeInstanceOf(PrivateKey);
      expect(signer.privateKey.type).toBe('ED25519');
    });

    it('should accept a ED25519 private key as a parameter in DER format', () => {
      const privateKey = PrivateKey.generateED25519().toStringDer();
      const signer = new InternalSigner(privateKey);

      expect(signer.privateKey).toBeInstanceOf(PrivateKey);
      expect(signer.privateKey.type).toBe('ED25519');
    });

    it('should throw an error if the private key is not ED25519', () => {
      const privateKey = PrivateKey.generateECDSA();
      expect(() => new InternalSigner(privateKey)).toThrow(
        'Invalid private key type. Expected ED25519.',
      );
    });

    it('should throw an error if the private key is not in DER format', () => {
      const privateKey = PrivateKey.generateED25519().toStringRaw();
      expect(() => new InternalSigner(privateKey)).toThrow(
        'Invalid private key format. Expected DER.',
      );
    });
  });

  describe('getting the public key', () => {
    it('should return the matching public key', () => {
      const privateKey = PrivateKey.generateED25519();
      const signer = new InternalSigner(privateKey.toStringDer());

      const publicKey = signer.publicKey();

      expect(publicKey).toBe(privateKey.publicKey.toStringDer());
    });
  });

  describe('signing and verifying a message', () => {
    it('should sign a message', () => {
      const privateKey = PrivateKey.generateED25519();
      const signer = new InternalSigner(privateKey);

      const message = Buffer.from('Hello, Hedera!');
      const signature = signer.sign(message);

      expect(signature).toBeInstanceOf(Uint8Array);
      expect(signature.length).toBeGreaterThan(0);
    });

    it('should generate always the same signature for the same message', () => {
      const privateKey = PrivateKey.generateED25519();
      const signer = new InternalSigner(privateKey);

      const message = Buffer.from('Hello, Hedera!');
      const signature1 = signer.sign(message);
      const signature2 = signer.sign(message);

      expect(signature1).toEqual(signature2);
    });

    it('should verify a valid signature', () => {
      const privateKey = PrivateKey.generateED25519();
      const signer = new InternalSigner(privateKey);

      const message = Buffer.from('Hello, Hedera!');
      const signature = signer.sign(message);

      const isValid = signer.verify(message, signature);

      expect(isValid).toBe(true);
    });

    it('should verify a valid signature with another signer instance', () => {
      const privateKey = PrivateKey.generateED25519();
      const signer = new InternalSigner(privateKey.toStringDer());

      const message = Buffer.from('Hello, Hedera!');
      const signature = signer.sign(message);

      const verifier = new InternalSigner(privateKey.toStringDer());
      const isValid = verifier.verify(message, signature);

      expect(isValid).toBe(true);
    });

    it('should not verify an invalid signature', () => {
      const privateKey = PrivateKey.generateED25519();
      const signer = new InternalSigner(privateKey);

      const message = Buffer.from('Hello, Hedera!');
      const signature = signer.sign(message);

      const tamperedMessage = Buffer.from('Hello, Hedera?');

      const isValid = signer.verify(tamperedMessage, signature);

      expect(isValid).toBe(false);
    });

    it('should not verify a signature with a different key', () => {
      const privateKey1 = PrivateKey.generateED25519();
      const signer1 = new InternalSigner(privateKey1);

      const privateKey2 = PrivateKey.generateED25519();
      const signer2 = new InternalSigner(privateKey2);

      const message = Buffer.from('Hello, Hedera!');
      const signature = signer1.sign(message);

      const isValid = signer2.verify(message, signature);

      expect(isValid).toBe(false);
    });
  });
});
