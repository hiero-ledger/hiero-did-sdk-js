import { encode, decode } from 'cbor2';

/**
 * `CborCodec` is a simple utility class for encoding and decoding CBOR data.
 */
export class CborCodec {
  /**
   * Decodes a CBOR encoded string or Uint8Array into a Uint8Array.
   * @param data The CBOR encoded string or Uint8Array.
   * @returns The Uint8Array.
   */
  static decode(data: Uint8Array | string): Uint8Array {
    const result: Uint8Array = decode(data);
    return result;
  }

  /**
   * Encodes a string, object, or Uint8Array into a CBOR encoded Uint8Array.
   * @param data The string, object, or Uint8Array to encode.
   * @returns The CBOR encoded Uint8Array.
   */
  static encode(data: Uint8Array | string | object): Uint8Array {
    const encodedData = encode(data);
    return encodedData;
  }

  /**
   * Encodes a string, object, or Uint8Array into a CBOR encoded HEX string.
   * @param data The string, object, or Uint8Array to encode.
   * @returns The CBOR encoded HEX string.
   */
  static encodeHex(data: Uint8Array | string | object): string {
    const encodedData = CborCodec.encode(data);
    return Buffer.from(encodedData).toString('hex').toUpperCase();
  }
}
