/*
 * This example demonstrates how to decompress a Uint8Array using
 * the `Zstd.decompress` static method from the Zstd package.
 *
 * It assumes you have previously compressed data, and now
 * want to restore the original data from the compressed form.
 */
import { Zstd } from '@hiero-did-sdk/zstd';

const compressedData = new Uint8Array([40, 181, 47, 253, 32, 10, 81, 0, 0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10]);

function main() {
  try {
    const decompressed = Zstd.decompress(compressedData);
    console.log('Decompressed data:', decompressed);
  } catch (error) {
    console.error('Error during decompression:', error);
  }
}

main();
