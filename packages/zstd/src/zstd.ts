import { Buffer } from 'buffer';

interface ZstdModule {
  compress(data: Uint8Array): Uint8Array;
  decompress(data: Uint8Array): Uint8Array;
}

export class Zstd {
  public static compress(data: Uint8Array): Uint8Array {
    const zstdModule = getAvailableZstdModule();
    return zstdModule.compress(data);
  }

  public static decompress(data: Uint8Array): Uint8Array {
    const zstdModule = getAvailableZstdModule();
    return zstdModule.decompress(data);
  }
}

function getAvailableZstdModule(): ZstdModule {
  // 1. Try to use Node.js 'zstd-napi' package
  try {
    const nodeZstd = require('zstd-napi');
    if (nodeZstd) return nodeZstd;
  } catch {
    // Ignore
  }

  // 2. Try to use 'react-native-zstd' package (for React Native environments)
  try {
    const rnZstd = require('react-native-zstd');
    if (rnZstd)
      return {
        // Additional data conversion is needed due to inconsistent API between Node and RN implementations
        compress: (data: Uint8Array): Uint8Array => rnZstd.compress(Buffer.from(data).toString()),
        decompress: (data: Uint8Array): Uint8Array => Uint8Array.from(Buffer.from(rnZstd.decompress([...data]))),
      };
  } catch {
    // Ignore
  }

  throw new Error(
    "No available zstd module found. Please install 'zstd-napi' or 'react-native-zstd' depending on a platform"
  );
}
