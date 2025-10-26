// Please note that we should not use named exports for 'varint' package as it causes compatibility issues for ESM environments
// See https://github.com/hiero-ledger/hiero-did-sdk-js/issues/35
import varint from 'varint';

import { Buffer } from 'buffer';

export class VarintCodec {
  public static decode(data: Uint8Array | number[] | Buffer): readonly [number, number] {
    const code = varint.decode(data);
    return [code, varint.decode.bytes] as const;
  }

  public static encode(int: number): Uint8Array {
    const target = Buffer.alloc(varint.encodingLength(int));
    varint.encode(int, target);
    return new Uint8Array(target);
  }
}
