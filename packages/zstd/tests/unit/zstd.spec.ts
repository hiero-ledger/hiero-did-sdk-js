/* eslint-disable @typescript-eslint/no-unused-vars */
import { Zstd } from '@hiero-did-sdk/zstd';
import { nodeZstd } from '../../src/node-zstd';
import { rnZstd } from '../../src/react-native-zstd';

const mockData = new TextEncoder().encode('mock-data');
const compressedMockData = Uint8Array.from([0x1, 0x2, 0x3]);

const engines = ['zstd-napi', 'react-native-zstd'] as const;

const zstdMock = {
  compress: (_: Uint8Array) => compressedMockData,
  decompress: (_: Uint8Array) => mockData,
};

describe('Zstd', () => {
  it('should throw an error if no compatible zstd module is found', () => {
    // @ts-expect-error Override resolved module
    nodeZstd = undefined;
    // @ts-expect-error Override resolved module
    rnZstd = undefined;

    const data = new Uint8Array([0x1, 0x2, 0x3]);
    expect(() => Zstd.compress(data)).toThrow(
      "No available zstd module found. Please install 'zstd-napi' or 'react-native-zstd' depending on a platform"
    );
  });

  describe.each(engines)('with $name', (engine) => {
    beforeEach(() => {
      if (engine === 'zstd-napi') {
        // @ts-expect-error Override resolved module
        nodeZstd = zstdMock;
        // @ts-expect-error Override resolved module
        rnZstd = undefined;
      } else if (engine === 'react-native-zstd') {
        // @ts-expect-error Override resolved module
        nodeZstd = undefined;
        // @ts-expect-error Override resolved module
        rnZstd = zstdMock;
      }
    });

    it('should compress data', () => {
      const output = Zstd.compress(mockData);
      expect(output).toEqual(compressedMockData);
    });

    it('should decompress data', () => {
      const output = Zstd.decompress(compressedMockData);
      expect(output).toEqual(mockData);
    });
  });
});
