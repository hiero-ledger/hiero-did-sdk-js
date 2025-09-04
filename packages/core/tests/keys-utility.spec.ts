import { PrivateKey } from '@hashgraph/sdk';
import { KeysUtility, MULTICODEC_PREFIXES } from '../src';
import { Buffer } from 'buffer';
import { MultibaseCodec } from '../src/utils/multibase-codec';
import { VarintCodec } from '../src/utils/varint-codec';

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
    'should transform from base58 to %s',
    async (toFunc) => {
      const privateKey = await PrivateKey.generateED25519Async();
      const keyUtil = KeysUtility.fromBase58(KeysUtility.fromBytes(privateKey.publicKey.toBytes()).toBase58());
      expect(keyUtil[toFunc]()).toBeDefined();
    }
  );

  it.each(['toMultibase', 'toPublicKey', 'toBytes', 'toBase58', 'toDerString'] as const)(
    'should transform from public key to %s',
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

  it.each(['ED25519', 'secp256k1'] as const)(
    'should convert key to multibase with multicodec prefix and back',
    async (multicodecOption) => {
      const privateKey = await PrivateKey.generateED25519Async();
      const keyUtil = KeysUtility.fromBytes(privateKey.publicKey.toBytes());

      const multibaseWithPrefix = keyUtil.toMultibase('base58btc', multicodecOption);
      const keyUtilFromMultibase = KeysUtility.fromMultibase(multibaseWithPrefix);

      expect(keyUtilFromMultibase.toBytes()).toStrictEqual(privateKey.publicKey.toBytes());
    }
  );

  it.each(['ED25519', 'secp256k1'] as const)(
    'should convert key to multibase with multicodec prefix and back using explicit method',
    async (multicodecOption) => {
      const privateKey = await PrivateKey.generateED25519Async();
      const keyUtil = KeysUtility.fromBytes(privateKey.publicKey.toBytes());

      const multibaseWithPrefix = keyUtil.toMulticodecMultibase(multicodecOption);
      const keyUtilFromMultibase = KeysUtility.fromMulticodecMultibase(multibaseWithPrefix);

      expect(keyUtilFromMultibase.toBytes()).toStrictEqual(privateKey.publicKey.toBytes());
    }
  );

  it('should add correct multicodec prefix', async () => {
    const privateKey = await PrivateKey.generateED25519Async();
    const keyUtil = KeysUtility.fromBytes(privateKey.publicKey.toBytes());

    const noPrefixBytes = MultibaseCodec.decode(keyUtil.toMultibase('base58btc', null));
    const ed25519PrefixBytes = MultibaseCodec.decode(keyUtil.toMultibase('base58btc', 'ED25519'));
    const secp256k1PrefixBytes = MultibaseCodec.decode(keyUtil.toMultibase('base58btc', 'secp256k1'));

    expect(noPrefixBytes.length).toBe(32);
    expect(ed25519PrefixBytes.length).toBe(34);
    expect(secp256k1PrefixBytes.length).toBe(34);

    expect(ed25519PrefixBytes.subarray(0, 2)).toEqual(VarintCodec.encode(MULTICODEC_PREFIXES.ED25519));
    expect(secp256k1PrefixBytes.subarray(0, 2)).toEqual(VarintCodec.encode(MULTICODEC_PREFIXES.secp256k1));
  });

  it('should throw error when parsing multibase with unsupported multicodec prefix', () => {
    const invalidMultibase = new Uint8Array([123, 0, 1, 2, 3, 4, 5]);

    expect(() => {
      KeysUtility.fromMulticodecMultibase(MultibaseCodec.encode(invalidMultibase));
    }).toThrow('Cannot parse multicodec key - prefix 123 is not supported');
  });
});
