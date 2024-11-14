import { PrivateKey } from '@hashgraph/sdk';

/**
 * Check if the given key is a valid Ed25519 private key in DER format.
 * @param key The DER encoded private key.
 * @returns True if the key is a valid Ed25519 private key, false otherwise.
 */
export function isEd25519DerPrivateKeyString(key: string): boolean {
  if (key.length !== 96) {
    return false;
  }

  return key.startsWith('302e020100300506032b657004220420');
}

/**
 * Check if the given PrivateKey instance is an Ed25519 private key.
 * @param privateKey The private key instance to check.
 * @returns True if the key is an Ed25519 private key, false otherwise.
 */
export function isEd25519PrivateKey(privateKey: PrivateKey): boolean {
  return privateKey.type === 'ED25519';
}
