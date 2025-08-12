/*
 * This example demonstrates how to compress a Uint8Array using
 * the `Zstd.compress` static method from the Zstd package.
 *
 * The example shows how to take raw binary data, compress it,
 * and output the compressed result.
 */
import { Zstd } from '@hiero-did-sdk/zstd';

const inputData = new Uint8Array([1, 2, 3, 4, 5, 6, 7, 8, 9, 10]);

function main() {
  try {
    const compressed = Zstd.compress(inputData);
    console.log('Compressed data:', compressed);
  } catch (error) {
    console.error('Error during compression:', error);
  }
}

main();
