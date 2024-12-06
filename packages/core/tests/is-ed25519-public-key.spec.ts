import { PrivateKey } from '@hashgraph/sdk';
import { isEd25519PublicKey } from '../src';
import { MultibaseCodec } from '../src/utils/multibase-codec';

describe('ED25519 public key validator', () => {
  it.each([
    'z', // Invalid base58 public key
    'null',
    '',
    null,
    true,
    false,
    0,
    1,
    {},
    [],
    new Uint8Array(0),
  ])('should return false for invalid ED25519 public keys', (key) => {
    expect(isEd25519PublicKey(key as never)).toBe(false);
  });

  it('should return true for valid ED25519 public keys in bytes', async () => {
    const privateKey = await PrivateKey.generateED25519Async();
    const publicKey = privateKey.publicKey;

    expect(isEd25519PublicKey(publicKey.toBytesRaw())).toBe(true);
  });

  it('should return true for valid ED25519 public keys in multibase', async () => {
    const privateKey = await PrivateKey.generateED25519Async();
    const publicKey = privateKey.publicKey;

    const multibasePublicKey = MultibaseCodec.encode(publicKey.toBytesRaw());

    expect(isEd25519PublicKey(multibasePublicKey)).toBe(true);
  });
});
