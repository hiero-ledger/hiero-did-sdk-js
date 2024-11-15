import { PublicKey } from '@hashgraph/sdk';
import { base58 } from '@scure/base';

/**
 * `KeysUtility` is a simple utility class for working with public keys transformed into different formats.
 */
export class KeysUtility {
  private constructor(private readonly bytes: Uint8Array) {}

  /**
   * Transforms the public key into a multibase string.
   * A multibase string using the base58 encoding.
   * @returns The multibase string.
   */
  toMultibase(): string {
    return `z${this.toBase58()}`;
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
   * Transforms the public key into a base58 string.
   * @returns The base58 string.
   */
  toBase58(): string {
    const publicKeyBase58 = base58.encode(this.bytes);
    return publicKeyBase58;
  }

  /**
   * Loads a public key from a Hashgraph PublicKey instance.
   * @param publicKey The Hashgraph PublicKey instance.
   * @returns The KeysUtility instance.
   */
  static fromPublicKey(publicKey: PublicKey): KeysUtility {
    return new KeysUtility(publicKey.toBytes());
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
    // TODO: Check if the bytes are valid public key
    return new KeysUtility(bytes);
  }

  /**
   * Loads a public key from a base58 string.
   * @param base58 The base58 string representing the public key.
   * @returns The KeysUtility instance.
   */
  static fromBase58(base58String: string): KeysUtility {
    // TODO: Check if the base58 string is valid public key
    const bytes = base58.decode(base58String);
    return new KeysUtility(bytes);
  }
}
