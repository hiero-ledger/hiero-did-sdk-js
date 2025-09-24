import { nodeZstd } from './node-zstd';
import { rnZstd } from './react-native-zstd';

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
  if (nodeZstd) return nodeZstd;
  else if (rnZstd) return rnZstd;

  throw new Error(
    "No available zstd module found. Please install 'zstd-napi' or 'react-native-zstd' depending on a platform"
  );
}
