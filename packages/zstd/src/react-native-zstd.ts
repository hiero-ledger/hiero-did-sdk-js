// Please note that splitting optional dependencies loading to a separate files is done to avoid significant issues with React Native Metro bundler
// See https://github.com/facebook/metro/issues/836

import { Buffer } from 'buffer';

export let rnZstd;

// Try to load 'react-native-zstd' package (for React Native environments)
try {
  const rnZstdModule = require('react-native-zstd');
  if (rnZstdModule.compress) {
    rnZstd = {
      // Additional data conversion is needed due to inconsistent API between Node and RN implementations
      compress: (data: Uint8Array): Uint8Array => rnZstdModule.compress(Buffer.from(data).toString()),
      decompress: (data: Uint8Array): Uint8Array => Uint8Array.from(Buffer.from(rnZstdModule.decompress([...data]))),
    };
  }
} catch {
  // Ignore
}
