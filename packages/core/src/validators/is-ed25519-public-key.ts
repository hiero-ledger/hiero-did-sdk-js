import { MultibaseCodec } from '../utils/multibase-codec';

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
      keyBytes = MultibaseCodec.decode(bytesOrMultibase);
    } catch {
      return false;
    }
  } else {
    keyBytes = bytesOrMultibase;
  }

  if (keyBytes instanceof Uint8Array === false) {
    return false;
  }

  if (keyBytes.length !== 32) {
    return false;
  }

  return true;
}

export { isEd25519PublicKey };
