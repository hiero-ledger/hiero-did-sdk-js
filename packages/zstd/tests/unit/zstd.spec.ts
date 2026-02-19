import { Zstd } from '@hiero-did-sdk/zstd';
import * as nodeZstdModule  from '../../src/node-zstd';
import * as rnZstdModule  from '../../src/react-native-zstd';

const mockData = new TextEncoder().encode('mock-data');
const compressedMockData = Uint8Array.from([0x1, 0x2, 0x3]);

const engines = ['zstd-napi', 'react-native-zstd'] as const;

let zstdMock;

describe('Zstd', () => {
  beforeEach(() => {
    zstdMock = {
      compress: (_: Uint8Array) => compressedMockData,
      decompress: (_: Uint8Array) => mockData,
    };
  })
  it('should throw an error if no compatible zstd module is found', () => {
    vi.spyOn(nodeZstdModule, 'nodeZstd', 'get').mockReturnValue(undefined);
    vi.spyOn(rnZstdModule, 'rnZstd', 'get').mockReturnValue(undefined);

    const data = new Uint8Array([0x1, 0x2, 0x3]);
    expect(() => Zstd.compress(data)).toThrow(
      "No available zstd module found. Please install 'zstd-napi' or 'react-native-zstd' depending on a platform"
    );
  });

  describe.each(engines)('with $name', (engine) => {
    beforeEach(() => {
      if (engine === 'zstd-napi') {
        vi.spyOn(nodeZstdModule, 'nodeZstd', 'get').mockReturnValue(zstdMock);
        vi.spyOn(rnZstdModule, 'rnZstd', 'get').mockReturnValue(undefined);
      } else if (engine === 'react-native-zstd') {
        vi.spyOn(nodeZstdModule, 'nodeZstd', 'get').mockReturnValue(undefined);
        vi.spyOn(rnZstdModule, 'rnZstd', 'get').mockReturnValue(zstdMock);
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
