import { Encoder, Decoder } from 'cbor-x';
import { Buffer } from 'buffer';

/**
 * `CborCodec` is a simple utility class for encoding and decoding CBOR data.
 * (adapted to cbor2)
 */
export class CborCodec {
  /**
   * Decodes a CBOR encoded string or Uint8Array into a Uint8Array.
   * @param data The CBOR encoded string or Uint8Array.
   * @returns The Uint8Array.
   */
  static decode(data: Uint8Array | string): Uint8Array {
    const buffer = typeof data === 'string' ? Buffer.from(data, 'hex') : data;

    const decoder = new Decoder({
      useRecords: false,
      bundleStrings: false,
      mapsAsObjects: true,
    });
    const result: Uint8Array = decoder.decode(buffer);
    return result;
  }

  /**
   * Encodes a string, object, or Uint8Array into a CBOR encoded Uint8Array.
   * @param data The string, object, or Uint8Array to encode.
   * @returns The CBOR encoded Uint8Array.
   */
  static encode(data: Uint8Array | string | object): Uint8Array {
    const encoder = new Encoder({
      bundleStrings: false,
      tagUint8Array: false,
      useRecords: false,
      mapsAsObjects: true,
      variableMapSize: true,
      pack: false,
      sequential: true,
    });
    const encodedData = encoder.encode(data);
    return new Uint8Array(encodedData.buffer, encodedData.byteOffset, encodedData.byteLength);
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
