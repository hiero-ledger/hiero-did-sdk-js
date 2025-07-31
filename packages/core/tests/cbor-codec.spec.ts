import { CborCodec } from '../src';

describe('CBOR format utilities', () => {
  describe('encoding', () => {
    it.each([
      ['Uint8Array', 'encode', new Uint8Array([0x65, 0x68, 0x65, 0x6c, 0x6c, 0x6f])],
      ['HEX', 'encodeHex', '6568656C6C6F'],
    ] as const)('should encode a string to cbor data [%s]', (_, methodName, expected) => {
      const encoded = CborCodec[methodName]('hello');
      expect(encoded).toEqual(expected);
    });

    it.each([
      ['Uint8Array', 'encode', new Uint8Array([0xa1, 0x63, 0x66, 0x6f, 0x6f, 0x63, 0x62, 0x61, 0x72])],
      ['HEX', 'encodeHex', 'A163666F6F63626172'],
    ] as const)('should encode an object to cbor data [%s]', (_, methodName, expected) => {
      const encoded = CborCodec[methodName]({ foo: 'bar' });
      expect(encoded).toEqual(expected);
    });

    it.each([
      ['Uint8Array', 'encode', new Uint8Array([0x42, 0xa1, 0xff])],
      ['HEX', 'encodeHex', '42A1FF'],
    ] as const)('should encode a Uint8Array to cbor data [%s]', (_, methodName, expected) => {
      const encoded = CborCodec[methodName](new Uint8Array([0xa1, 0xff]));
      expect(encoded).toEqual(expected);
    });

    it('should return a Uint8Array', () => {
      const encoded = CborCodec.encode('hello');
      expect(encoded).toBeInstanceOf(Uint8Array);
    });

    it('should return a string', () => {
      const encoded = CborCodec.encodeHex('hello');
      expect(typeof encoded).toBe('string');
    });
  });

  describe('decoding', () => {
    it.each([
      ['Uint8Array', new Uint8Array([0x65, 0x68, 0x65, 0x6c, 0x6c, 0x6f])],
      ['HEX', '6568656C6C6F'],
    ] as const)('should decode cbor data to a string [%s]', (_, data) => {
      const decoded = CborCodec.decode(data);
      expect(decoded).toEqual('hello');
    });

    it.each([
      ['Uint8Array', new Uint8Array([0xa1, 0x63, 0x66, 0x6f, 0x6f, 0x63, 0x62, 0x61, 0x72])],
      ['HEX', 'A163666F6F63626172'],
    ] as const)('should decode cbor data to an object [%s]', (_, data) => {
      const decoded = CborCodec.decode(data);
      expect(decoded).toEqual({ foo: 'bar' });
    });

    it.each([
      ['Uint8Array', new Uint8Array([0xd8, 0x40, 0x42, 0xa1, 0xff])],
      ['HEX', 'D84042A1FF'],
    ] as const)('should decode cbor data to a Uint8Array [%s]', (_, data) => {
      const decoded = CborCodec.decode(data);
      expect(decoded).toEqual(new Uint8Array([0xa1, 0xff]));
    });
  });

  it('should encode and decode to the same value [string]', () => {
    const data = 'hello';
    const encoded = CborCodec.encode(data);
    const decoded = CborCodec.decode(encoded);
    expect(decoded).toEqual(data);
  });

  it('should encode and decode to the same value [object]', () => {
    const data = { foo: 'bar' };
    const encoded = CborCodec.encode(data);
    const decoded = CborCodec.decode(encoded);
    expect(decoded).toEqual(data);
  });
});
