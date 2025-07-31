import { Zstd } from '@hiero-did-sdk/zstd';

describe('Zstd', () => {
  const testString = 'Test data for zstd compression/decompression';

  const data = new TextEncoder().encode(testString);
  const compressedData = [
    40, 181, 47, 253, 32, 44, 77, 1, 0, 20, 2, 84, 101, 115, 116, 32, 100, 97, 116, 97, 32, 102, 111, 114, 32, 122, 115,
    116, 100, 32, 99, 111, 109, 112, 114, 101, 115, 115, 105, 111, 110, 47, 100, 101, 1, 0, 9, 99, 62, 1,
  ];

  it('should compress data correctly', () => {
    const compressed = Zstd.compress(data);
    expect(compressed).toBeInstanceOf(Uint8Array);
    expect(Array.from(compressed)).toEqual(compressedData);
  });

  it('should decompress data to original', () => {
    const compressed = new Uint8Array(compressedData);
    const decompressed = Zstd.decompress(compressed);

    expect(decompressed).toBeInstanceOf(Uint8Array);
    expect(new TextDecoder().decode(decompressed)).toBe(testString);
  });

  it('should handle round-trip compression/decompression', () => {
    const compressed = Zstd.compress(data);
    const decompressed = Zstd.decompress(compressed);

    expect(Array.from(decompressed)).toEqual(Array.from(data));
  });
});
