import { Buffer } from 'buffer';

type HashInput = string | Buffer | Uint8Array | ArrayBuffer;

interface CryptoModule {
  createHash?(algorithm: string): Hash;
  SHA256?(data: HashInput): { toString(): string };
}

interface Hash {
  update(data: HashInput): Hash;
  digest(encoding: 'hex'): string;
}

export class Crypto {
  public static sha256(data: HashInput): string {
    const cryptoModule = getAvailableCryptoModule();

    const buffer = convertInputToBuffer(data);
    return cryptoModule.createHash('sha256').update(buffer).digest('hex');
  }
}

function getAvailableCryptoModule(): CryptoModule {
  // 1. Try to use built-in Node.js crypto module
  try {
    const nodeCrypto = require('crypto');
    if (nodeCrypto.createHash) return nodeCrypto;
  } catch {
    // Ignore
  }

  // 2. Try to use 'react-native-quick-crypto' package (for React Native environments)
  try {
    const rnCrypto = require('react-native-quick-crypto');
    if (rnCrypto.createHash) return rnCrypto;
  } catch {
    // Ignore
  }

  throw new Error(
    "No compatible crypto module found. Please install 'react-native-quick-crypto' or 'crypto' polyfills depending on platform"
  );
}

function convertInputToBuffer(data: HashInput): Buffer {
  if (typeof data === 'string') {
    return Buffer.from(data, 'utf-8');
  }
  if (data instanceof ArrayBuffer) {
    return Buffer.from(data);
  }
  if (Buffer.isBuffer(data)) {
    return data;
  }
  return Buffer.from(data);
}
