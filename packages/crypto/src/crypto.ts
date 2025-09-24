import { Buffer } from 'buffer';
import { nodeCrypto } from './node-crypto';
import { rnCrypto } from './react-native-crypto';

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
  if (nodeCrypto) return nodeCrypto;
  else if (rnCrypto) return rnCrypto;

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
