export interface RevocationRegistryEntryMessageWrapper {
  payload: string;
}

export interface RevocationRegistryEntryMessage {
  ver?: string;
  value?: {
    accum?: string;
    prevAccum?: string;
    issued?: number[];
    revoked?: number[];
  };
}
