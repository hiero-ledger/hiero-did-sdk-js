import { encode, decode, encodingLength } from 'varint';

import { Buffer } from 'buffer';

export class VarintCodec {
  public static decode(data: Uint8Array | number[] | Buffer) {
    const code = decode(data);
    return [code, decode.bytes] as const;
  }

  public static encode(int: number) {
    const target = Buffer.alloc(encodingLength(int));
    encode(int, target);
    return target;
  }
}
