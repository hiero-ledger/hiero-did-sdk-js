import { VarintCodec } from '../src/utils/varint-codec';
import { Buffer } from 'buffer';

describe('Varint format utilities', () => {
  describe('encoding', () => {
    it.each([
      [0, new Uint8Array([0x00])],
      [1, new Uint8Array([0x01])],
      [127, new Uint8Array([0x7f])],
      [128, new Uint8Array([0x80, 0x01])],
      [255, new Uint8Array([0xff, 0x01])],
      [300, new Uint8Array([0xac, 0x02])],
      [16384, new Uint8Array([0x80, 0x80, 0x01])],
    ])('should encode %s to correct varint bytes', (input, expected) => {
      const encoded = VarintCodec.encode(input);
      expect(encoded).toEqual(expected);
    });

    it('should return a Uint8Array', () => {
      const encoded = VarintCodec.encode(42);
      expect(encoded).toBeInstanceOf(Uint8Array);
    });
  });

  describe('decoding', () => {
    it.each([
      [new Uint8Array([0x00]), 0, 1],
      [new Uint8Array([0x01]), 1, 1],
      [new Uint8Array([0x7f]), 127, 1],
      [new Uint8Array([0x80, 0x01]), 128, 2],
      [new Uint8Array([0xff, 0x01]), 255, 2],
      [new Uint8Array([0xac, 0x02]), 300, 2],
      [new Uint8Array([0x80, 0x80, 0x01]), 16384, 3],
    ])('should decode %s to %s and consume %s bytes', (input, expectedValue, expectedBytes) => {
      const [value, bytesRead] = VarintCodec.decode(input);
      expect(value).toEqual(expectedValue);
      expect(bytesRead).toEqual(expectedBytes);
    });

    it('should decode from Buffer', () => {
      const buffer = Buffer.from([0x80, 0x01]);
      const [value, bytesRead] = VarintCodec.decode(buffer);
      expect(value).toEqual(128);
      expect(bytesRead).toEqual(2);
    });

    it('should decode from number array', () => {
      const array = [0x80, 0x01];
      const [value, bytesRead] = VarintCodec.decode(array);
      expect(value).toEqual(128);
      expect(bytesRead).toEqual(2);
    });
  });

  it('should encode and decode to the same value', () => {
    const testValues = [0, 1, 127, 128, 255, 300, 16384, 2097151, 268435455];

    for (const value of testValues) {
      const encoded = VarintCodec.encode(value);
      const [decoded] = VarintCodec.decode(encoded);
      expect(decoded).toEqual(value);
    }
  });
});
