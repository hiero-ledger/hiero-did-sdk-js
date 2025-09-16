import { PrivateKey } from '@hashgraph/sdk';
import { Signer } from '../src';
import { Buffer } from 'buffer';

describe('Internal signer class', () => {
  describe('initializing a signer', () => {
    it('should generate a new ED25519 key pair', () => {
      const signer = Signer.generate();

      expect(signer.privateKey).toBeInstanceOf(PrivateKey);
      expect(signer.privateKey.type).toBe('ED25519');
    });

    it('should accept a ED25519 private key as a parameter', () => {
      const privateKey = PrivateKey.generateED25519();
      const signer = new Signer(privateKey);

      expect(signer.privateKey).toBeInstanceOf(PrivateKey);
      expect(signer.privateKey.type).toBe('ED25519');
    });

    it('should accept a ED25519 private key as a parameter in DER format', () => {
      const privateKey = PrivateKey.generateED25519().toStringDer();
      const signer = new Signer(privateKey);

      expect(signer.privateKey).toBeInstanceOf(PrivateKey);
      expect(signer.privateKey.type).toBe('ED25519');
    });

    it('should throw an error if the private key is not ED25519', () => {
      const privateKey = PrivateKey.generateECDSA();
      expect(() => new Signer(privateKey)).toThrow('Invalid private key type. Expected ED25519.');
    });

    it('should throw an error if the private key is not in DER format', () => {
      const privateKey = PrivateKey.generateED25519().toStringRaw();
      expect(() => new Signer(privateKey)).toThrow('Invalid private key format. Expected DER.');
    });
  });

  describe('getting the public key', () => {
    it('should return the matching public key', async () => {
      const privateKey = PrivateKey.generateED25519();
      const signer = new Signer(privateKey.toStringDer());

      const publicKey = await signer.publicKey();

      expect(publicKey).toBe(privateKey.publicKey.toStringDer());
    });
  });

  describe('signing and verifying a message', () => {
    it('should sign a message', async () => {
      const privateKey = PrivateKey.generateED25519();
      const signer = new Signer(privateKey);

      const message = Buffer.from('Hello, Hedera!');
      const signature = await signer.sign(message);

      expect(signature).toBeInstanceOf(Uint8Array);
      expect(signature.length).toBeGreaterThan(0);
    });

    it('should generate always the same signature for the same message', async () => {
      const privateKey = PrivateKey.generateED25519();
      const signer = new Signer(privateKey);

      const message = Buffer.from('Hello, Hedera!');
      const signature1 = await signer.sign(message);
      const signature2 = await signer.sign(message);

      expect(signature1).toEqual(signature2);
    });

    it('should verify a valid signature', async () => {
      const privateKey = PrivateKey.generateED25519();
      const signer = new Signer(privateKey);

      const message = Buffer.from('Hello, Hedera!');
      const signature = await signer.sign(message);

      const isValid = await signer.verify(message, signature);

      expect(isValid).toBe(true);
    });

    it('should verify a valid signature with another signer instance', async () => {
      const privateKey = PrivateKey.generateED25519();
      const signer = new Signer(privateKey.toStringDer());

      const message = Buffer.from('Hello, Hedera!');
      const signature = await signer.sign(message);

      const verifier = new Signer(privateKey.toStringDer());
      const isValid = await verifier.verify(message, signature);

      expect(isValid).toBe(true);
    });

    it('should not verify an invalid signature', async () => {
      const privateKey = PrivateKey.generateED25519();
      const signer = new Signer(privateKey);

      const message = Buffer.from('Hello, Hedera!');
      const signature = await signer.sign(message);

      const tamperedMessage = Buffer.from('Hello, Hedera?');

      const isValid = await signer.verify(tamperedMessage, signature);

      expect(isValid).toBe(false);
    });

    it('should not verify a signature with a different key', async () => {
      const privateKey1 = PrivateKey.generateED25519();
      const signer1 = new Signer(privateKey1);

      const privateKey2 = PrivateKey.generateED25519();
      const signer2 = new Signer(privateKey2);

      const message = Buffer.from('Hello, Hedera!');
      const signature = await signer1.sign(message);

      const isValid = await signer2.verify(message, signature);

      expect(isValid).toBe(false);
    });
  });
});
