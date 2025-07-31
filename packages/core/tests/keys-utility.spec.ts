import { PrivateKey } from '@hashgraph/sdk';
import { KeysUtility } from '../src';
import { Buffer } from 'buffer';

describe('Keys utility', () => {
  it.each(['toMultibase', 'toPublicKey', 'toBytes', 'toBase58', 'toDerString'] as const)(
    'should transform from der string to %s',
    async (toFunc) => {
      const privateKey = await PrivateKey.generateED25519Async();
      const keyUtil = KeysUtility.fromDerString(privateKey.publicKey.toStringDer());
      expect(keyUtil[toFunc]()).toBeDefined();
    }
  );

  it.each(['toMultibase', 'toPublicKey', 'toBytes', 'toBase58', 'toDerString'] as const)(
    'should transform from bytes to %s',
    async (toFunc) => {
      const privateKey = await PrivateKey.generateED25519Async();
      const keyUtil = KeysUtility.fromBytes(privateKey.publicKey.toBytes());
      expect(keyUtil[toFunc]()).toBeDefined();
    }
  );

  it.each(['toMultibase', 'toPublicKey', 'toBytes', 'toBase58', 'toDerString'] as const)(
    'should transform from from base58 to %s',
    async (toFunc) => {
      const privateKey = await PrivateKey.generateED25519Async();
      const keyUtil = KeysUtility.fromBase58(KeysUtility.fromBytes(privateKey.publicKey.toBytes()).toBase58());
      expect(keyUtil[toFunc]()).toBeDefined();
    }
  );

  it.each(['toMultibase', 'toPublicKey', 'toBytes', 'toBase58', 'toDerString'] as const)(
    'should transform from from public key to %s',
    async (toFunc) => {
      const privateKey = await PrivateKey.generateED25519Async();
      const keyUtil = KeysUtility.fromPublicKey(privateKey.publicKey);
      expect(keyUtil[toFunc]()).toBeDefined();
    }
  );

  it('should return the same key for base58', async () => {
    const privateKey = await PrivateKey.generateED25519Async();
    const base58Key = KeysUtility.fromBytes(privateKey.publicKey.toBytes()).toBase58();
    const keyUtil = KeysUtility.fromBase58(base58Key);
    expect(keyUtil.toBase58()).toBe(base58Key);
  });

  it('should return the same key for bytes', async () => {
    const privateKey = await PrivateKey.generateED25519Async();
    const keyUtil = KeysUtility.fromBytes(privateKey.publicKey.toBytes());
    expect(keyUtil.toBytes()).toStrictEqual(privateKey.publicKey.toBytes());
  });

  it('should return the same key for PublicKey', async () => {
    const privateKey = await PrivateKey.generateED25519Async();
    const keyUtil = KeysUtility.fromPublicKey(privateKey.publicKey);
    expect(keyUtil.toPublicKey()).toStrictEqual(privateKey.publicKey);
  });

  it('should return the same key for der string', async () => {
    const privateKey = await PrivateKey.generateED25519Async();
    const keyUtil = KeysUtility.fromDerString(privateKey.publicKey.toStringDer());

    expect(keyUtil.toDerString()).toBe(privateKey.publicKey.toStringDer());
  });

  it('should convert key from base64 to the same key', async () => {
    const privateKey = await PrivateKey.generateED25519Async();
    const keyUtil = KeysUtility.fromBase64(Buffer.from(privateKey.publicKey.toBytes()).toString('base64'));

    expect(keyUtil.toBytes()).toStrictEqual(privateKey.publicKey.toBytes());
  });

  it('should convert key from multibase to the same key', () => {
    const multibase = 'z6MkhaXgBZDvotDkL5257faiztiGiC2QtKLGpbnnEGta2doK';
    const keyUtil = KeysUtility.fromMultibase(multibase);

    expect(keyUtil.toMultibase()).toStrictEqual(multibase);
  });
});
