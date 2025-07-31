import { Zstd } from '@hiero-did-sdk/zstd';

const mockData = new TextEncoder().encode('mock-data');
const compressedMockData = Uint8Array.from([0x1, 0x2, 0x3]);

const engines = [{ name: 'zstd-napi' }, { name: 'react-native-zstd' }];

const zstdMock = {
  compress: (_: Uint8Array) => compressedMockData,
  decompress: (_: Uint8Array) => mockData,
};

describe('Zstd', () => {
  beforeEach(() => {
    jest.mock('zstd-napi', () => undefined);
    jest.mock('react-native-zstd', () => undefined, { virtual: true });
    jest.resetModules();
  });

  it('should throw an error if no compatible zstd module is found', () => {
    jest.doMock('zstd-napi', () => {
      throw new Error();
    });
    jest.doMock(
      'react-native-zstd',
      () => {
        throw new Error();
      },
      { virtual: true }
    );

    const data = new Uint8Array([0x1, 0x2, 0x3]);
    expect(() => Zstd.compress(data)).toThrow(
      "No available zstd module found. Please install 'zstd-napi' or 'react-native-zstd' depending on a platform"
    );
  });

  describe.each(engines)('with $name', ({ name }) => {
    beforeEach(() => {
      if (name === 'zstd-napi') {
        jest.mock('zstd-napi', () => zstdMock);
        jest.mock('react-native-zstd', () => undefined);
      }
      if (name === 'react-native-zstd') {
        jest.mock('zstd-napi', () => undefined);
        jest.mock('react-native-zstd', () => zstdMock);
      }
      jest.resetModules();
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
