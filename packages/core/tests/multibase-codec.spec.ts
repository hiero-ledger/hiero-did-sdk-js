import { webcrypto } from 'crypto';
import { MultibaseCodec } from '../src/utils/multibase-codec';
import { Buffer } from 'buffer';

describe('Multibase format utilities', () => {
  const rawText = 'Multibase is awesome! \\o/';

  const exceptionsDecodeMap = {
    base16: 'f4d756c74696261736520697320617765736f6d6521205c6f2fc282',
    base16upper: 'F4D756C74696261736520697320617765736F6D6521205C6F2FC282',
    base32: 'bjv2wy5djmjqxgzjanfzsaylxmvzw63lfeeqfy3zpykba',
    base32upper: 'BJV2WY5DJMJQXGZJANFZSAYLXMVZW63LFEEQFY3ZPYKBA',
    base58btc: 'zBUCQvMAZK3DdStAPKRPfF9DujCD2AJAbDh321',
    base64: 'mTXVsdGliYXNlIGlzIGF3ZXNvbWUhIFxvL8KC',
    base64url: 'uTXVsdGliYXNlIGlzIGF3ZXNvbWUhIFxvL8KC',
    base64urlpad: 'UTXVsdGliYXNlIGlzIGF3ZXNvbWUhIFxvL8KC',
  };

  describe('encoding', () => {
    it.each([
      'base16',
      'base16upper',
      'base32',
      'base32upper',
      'base58btc',
      'base64',
      'base64url',
      'base64urlpad',
    ] as const)('should encode a utf8 text to %s', (algorithm) => {
      const encoded = MultibaseCodec.encode(Buffer.from(rawText, 'utf8'), algorithm);
      expect(encoded).toBe(exceptionsDecodeMap[algorithm]);
    });
  });

  describe('decoding', () => {
    it.each([
      'base16',
      'base16upper',
      'base32',
      'base32upper',
      'base58btc',
      'base64',
      'base64url',
      'base64urlpad',
    ] as const)('should decode a %s value to utf8', (algorithm) => {
      const decoded = MultibaseCodec.decode(exceptionsDecodeMap[algorithm]);
      expect(Buffer.from(decoded).toString('utf8')).toEqual(rawText);
    });
  });

  it.each([
    'base16',
    'base16upper',
    'base32',
    'base32upper',
    'base58btc',
    'base64',
    'base64url',
    'base64urlpad',
  ] as const)('should encode and decode to the same value [%s]', (algorithm) => {
    const value = Buffer.from(webcrypto.getRandomValues(new Uint8Array(32))).toString('utf-8');

    const encoded = MultibaseCodec.encode(Buffer.from(value, 'utf8'), algorithm);

    const decoded = MultibaseCodec.decode(encoded);

    expect(Buffer.from(decoded).toString('utf8')).toEqual(value);
  });

  it('should throw an error when decoding an invalid multibase string', () => {
    expect(() => MultibaseCodec.decode('invalid')).toThrow('Could not decode multibase string, invalid code point');
  });

  it('should throw an error when encoding with an invalid algorithm', () => {
    expect(() => MultibaseCodec.encode(Buffer.from(rawText, 'utf8'), 'invalid' as never)).toThrow(
      'Invalid multibase algorithm'
    );
  });
});
