import fc from 'fast-check';
import { MultibaseCodec } from '../src/utils/multibase-codec';
import { VarintCodec } from '../src/utils/varint-codec';

describe('Codec round-trip properties', () => {
  describe('VarintCodec', () => {
    it('should decode any encoded unsigned integer back to the original value', () => {
      fc.assert(
        fc.property(fc.integer({ min: 0, max: Number.MAX_SAFE_INTEGER }), (value) => {
          const encoded = VarintCodec.encode(value);
          const [decoded, bytesRead] = VarintCodec.decode(encoded);

          expect(decoded).toEqual(value);
          expect(bytesRead).toEqual(encoded.length);
        })
      );
    });

    it('should set the continuation bit on every byte except the last one', () => {
      fc.assert(
        fc.property(fc.integer({ min: 0, max: Number.MAX_SAFE_INTEGER }), (value) => {
          const encoded = VarintCodec.encode(value);

          for (let i = 0; i < encoded.length - 1; i++) {
            expect(encoded[i] & 0x80).toEqual(0x80);
          }
          expect(encoded[encoded.length - 1] & 0x80).toEqual(0);
        })
      );
    });
  });

  describe('MultibaseCodec', () => {
    it.each([
      ['base16', 'f'],
      ['base16upper', 'F'],
      ['base32', 'b'],
      ['base32upper', 'B'],
      ['base58btc', 'z'],
      ['base64', 'm'],
      ['base64url', 'u'],
      ['base64urlpad', 'U'],
    ] as const)('should decode any %s encoded bytes back to the original bytes', (algorithm, identifier) => {
      fc.assert(
        fc.property(fc.uint8Array({ maxLength: 256 }), (data) => {
          const encoded = MultibaseCodec.encode(data, algorithm);
          const decoded = MultibaseCodec.decode(encoded);

          expect(encoded.charAt(0)).toEqual(identifier);
          expect(decoded).toEqual(data);
        })
      );
    });

    it('should decode to the same bytes regardless of the algorithm used for encoding', () => {
      fc.assert(
        fc.property(
          fc.uint8Array({ maxLength: 256 }),
          fc.constantFrom('base16', 'base32', 'base58btc', 'base64', 'base64url', 'base64urlpad'),
          (data, algorithm) => {
            const encoded = MultibaseCodec.encode(data, algorithm);
            const reference = MultibaseCodec.encode(data);

            expect(MultibaseCodec.decode(encoded)).toEqual(MultibaseCodec.decode(reference));
          }
        )
      );
    });
  });
});
