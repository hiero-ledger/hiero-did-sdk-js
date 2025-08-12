/*
 * This example demonstrates how to compute the SHA-256 hash of a string using
 * the `Crypto.sha256` static method from the Crypto package.
 */
import { Crypto } from '@hiero-did-sdk/crypto';

const data = 'Hello, Hiero DID!';

function main() {
  try {
    const hash = Crypto.sha256(data);
    console.log('SHA-256 hash:', hash);
  } catch (error) {
    console.error('Error computing SHA-256 hash:', error);
  }
}

main();
