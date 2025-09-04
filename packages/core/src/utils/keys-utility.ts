import { PublicKey } from '@hashgraph/sdk';
import { base58 } from '@scure/base';
import { MultibaseAlgorithm, MultibaseCodec } from './multibase-codec';
import { Buffer } from 'buffer';
import { VarintCodec } from './varint-codec';
import { isEd25519PublicKey } from '../validators';

type Curve = 'ED25519' | 'secp256k1';

const MULTICODEC_PREFIXES: Record<Curve, number> = {
  ED25519: 237,
  secp256k1: 231,
};

/**
 * `KeysUtility` is a simple utility class for working with public keys transformed into different formats.
 */
export class KeysUtility {
  private constructor(private readonly bytes: Uint8Array) {}

  /**
   * Transforms the public key into a multibase string.
   * Default algorithm is 'base58btc'.
   * Default muticodec curve is 'ED25519'.
   * @returns The multibase string.
   */
  toMultibase(algorithm: MultibaseAlgorithm = 'base58btc', multicodecCurve: Curve | null = 'ED25519'): string {
    if (multicodecCurve) {
      return this.toMulticodecMultibase(multicodecCurve, algorithm);
    }

    return MultibaseCodec.encode(this.bytes, algorithm);
  }

  /**
   * Transforms the public key into a multibase string (with multicodec prefix).
   * Default algorithm is 'base58btc'.
   * @returns The multibase string.
   */
  toMulticodecMultibase(curve: Curve, algorithm: MultibaseAlgorithm = 'base58btc'): string {
    const prefixBytes = VarintCodec.encode(MULTICODEC_PREFIXES[curve]);
    const prefixedPublicKeyBytes = new Uint8Array([...prefixBytes, ...this.bytes]);

    return MultibaseCodec.encode(prefixedPublicKeyBytes, algorithm);
  }

  /**
   * Transforms the public key into a Hashgraph PublicKey instance.
   * @returns The Hashgraph PublicKey instance.
   */
  toPublicKey(): PublicKey {
    return PublicKey.fromBytes(this.bytes);
  }

  /**
   * Transforms the public key into a Uint8Array.
   * @returns The Uint8Array.
   */
  toBytes(): Uint8Array {
    return this.bytes;
  }

  /**
   * Transforms the public key into a der string.
   * @returns The der string.
   */
  toDerString(): string {
    const publicKey = this.toPublicKey();
    return publicKey.toStringDer();
  }

  /**
   * Transforms the public key into a base58 string.
   * @returns The base58 string.
   */
  toBase58(): string {
    return base58.encode(this.bytes);
  }

  /**
   * Loads a public key from a Hashgraph PublicKey instance.
   * @param publicKey The Hashgraph PublicKey instance.
   * @returns The KeysUtility instance.
   */
  static fromPublicKey(publicKey: PublicKey): KeysUtility {
    return new KeysUtility(publicKey.toBytesRaw());
  }

  /**
   * Loads a public key from a der string.
   * @param der The der string representing the public key.
   * @returns The KeysUtility instance.
   */
  static fromDerString(der: string): KeysUtility {
    const publicKey = PublicKey.fromString(der);
    return KeysUtility.fromPublicKey(publicKey);
  }

  /**
   * Loads a public key from a raw bytes.
   * @param bytes The raw bytes representing the public key.
   * @returns The KeysUtility instance.
   */
  static fromBytes(bytes: Uint8Array): KeysUtility {
    return new KeysUtility(bytes);
  }

  /**
   * Loads a public key from a base58 string.
   * @param base58String The base58 string representing the public key.
   * @returns The KeysUtility instance.
   */
  static fromBase58(base58String: string): KeysUtility {
    const bytes = base58.decode(base58String);
    return new KeysUtility(bytes);
  }

  /**
   * Loads a public key from a base64 string.
   * @param base64String The base64 string representing the public key.
   * @returns The KeysUtility instance.
   */
  static fromBase64(base64String: string): KeysUtility {
    const bytes = Uint8Array.from(Buffer.from(base64String, 'base64'));
    return new KeysUtility(bytes);
  }

  /**
   * Loads a public key from a multibase string.
   * @param multibase The multibase string representing the public key.
   * @returns The KeysUtility instance.
   */
  static fromMultibase(multibase: string): KeysUtility {
    const bytes = MultibaseCodec.decode(multibase);

    // If decoded bytes do not match Ed25519 public key right away, we should try to parse with multicodec prefix
    if (!isEd25519PublicKey(bytes)) {
      return this.fromMulticodecMultibase(multibase);
    }

    return new KeysUtility(bytes);
  }

  /**
   * Loads a public key from a multibase string (with multicodec prefix).
   * @param multibase The multibase string representing the public key.
   * @returns The KeysUtility instance.
   */
  static fromMulticodecMultibase(multibase: string): KeysUtility {
    const bytes = MultibaseCodec.decode(multibase);
    const [prefix] = VarintCodec.decode(bytes.subarray(0, 2));

    if (!Object.values(MULTICODEC_PREFIXES).includes(prefix)) {
      throw new Error(`Cannot parse multicodec key - prefix ${prefix} is not supported`);
    }

    return new KeysUtility(bytes.subarray(2));
  }
}
