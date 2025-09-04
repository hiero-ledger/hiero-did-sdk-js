import { KeysUtility } from '../utils';

/**
 * Verifies if the given bytes are a valid Ed25519 public key.
 * @param bytes The bytes to verify.
 * @returns True if the bytes are a valid Ed25519 public key, false otherwise.
 */
function isEd25519PublicKey(bytes: Uint8Array): boolean;
/**
 * Verifies if the given multibase encoded string is a valid Ed25519 public key.
 * @param multibase The multibase encoded string to verify.
 * @returns True if the multibase encoded string is a valid Ed25519 public key, false otherwise.
 */
function isEd25519PublicKey(multibase: string): boolean;
/**
 * Verifies if the given bytes or multibase encoded string is a valid Ed25519 public key.
 * @param bytesOrMultibase The bytes or multibase encoded string to verify.
 * @returns True if the bytes or multibase encoded string is a valid Ed25519 public key, false otherwise.
 */
function isEd25519PublicKey(bytesOrMultibase: string | Uint8Array): boolean {
  let keyBytes: Uint8Array;
  if (typeof bytesOrMultibase === 'string') {
    try {
      keyBytes = KeysUtility.fromMultibase(bytesOrMultibase).toBytes();
    } catch {
      return false;
    }
  } else {
    keyBytes = bytesOrMultibase;
  }

  if (keyBytes instanceof Uint8Array === false) {
    return false;
  }

  return keyBytes.length === 32;
}

export { isEd25519PublicKey };
