/*
 * This example demonstrates how to compute the SHA-256 hash of a Uint8Array input
 * using the `Crypto.sha256` static method from the Crypto package.
 */
import { Crypto } from '@hiero-did-sdk/crypto';

const uint8ArrayData = new Uint8Array([1, 2, 3, 4, 5]);

function main() {
  try {
    const hash = Crypto.sha256(uint8ArrayData);
    console.log('SHA-256 hash of Uint8Array:', hash);
  } catch (error) {
    console.error('Error computing SHA-256 hash:', error);
  }
}

main();
