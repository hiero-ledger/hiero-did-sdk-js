import {
  base16,
  base32nopad as base32,
  base58,
  base64nopad as base64,
  base64url as base64urlpad,
  base64urlnopad as base64url,
} from '@scure/base';
import { DIDError } from '../interfaces';

export type MultibaseAlgorithm =
  | 'base16'
  | 'base16upper'
  | 'base32'
  | 'base32upper'
  | 'base58btc'
  | 'base64'
  | 'base64url'
  | 'base64urlpad';

interface BaseFunction {
  decode: (data: string) => Uint8Array;
  encode: (data: Uint8Array) => string;
}

type Identifier = 'f' | 'F' | 'b' | 'B' | 'z' | 'm' | 'u' | 'U';

/**
 * `MultibaseCodec` is a simple utility class for encoding and decoding multibase strings.
 */
export class MultibaseCodec {
  private static algorithmMap: Record<Identifier, MultibaseAlgorithm> = {
    f: 'base16',
    F: 'base16upper',
    b: 'base32',
    B: 'base32upper',
    z: 'base58btc',
    m: 'base64',
    u: 'base64url',
    U: 'base64urlpad',
  };

  private static bases: Record<MultibaseAlgorithm, BaseFunction> = {
    base16: {
      decode: (data: string) => base16.decode(data.toUpperCase()),
      encode: (data: Uint8Array) => base16.encode(data).toLowerCase(),
    },
    base16upper: base16,
    base32: {
      decode: (data: string) => base32.decode(data.toUpperCase()),
      encode: (data: Uint8Array) => base32.encode(data).toLowerCase(),
    },
    base32upper: base32,
    base58btc: base58,
    base64,
    base64url,
    base64urlpad,
  };

  /**
   * Decodes a multibase encoded string into a Uint8Array.
   * @param data The multibase encoded string.
   * @returns The Uint8Array.
   * @throws Error if the string is not a valid multibase encoded string.
   */
  static decode(data: string): Uint8Array {
    const identifier = data[0] as Identifier;
    const algorithm = this.algorithmMap[identifier];
    const decoder = this.bases[algorithm];

    if (!decoder) {
      throw new DIDError(
        'invalidMultibase',
        'Could not decode multibase string, invalid code point',
      );
    }

    return decoder.decode(data.slice(1));
  }

  /**
   * Encodes a Uint8Array into a multibase string.
   * @param data The data in Uint8Array format.
   * @param algorithm The multibase algorithm to use. Default is 'base58btc'.
   * @returns The multibase string.
   */
  static encode(
    data: Uint8Array,
    algorithm: MultibaseAlgorithm = 'base58btc',
  ): string {
    const identifier = Object.keys(this.algorithmMap).find(
      (key: Identifier) => this.algorithmMap[key] === algorithm,
    );
    const encoder = this.bases[algorithm];

    if (!encoder) {
      throw new DIDError('invalidMultibase', 'Invalid multibase algorithm');
    }

    return `${identifier}${encoder.encode(data)}`;
  }
}
