export interface AnonCredsRevocationRegistryDefinition {
  issuerId: string;
  revocDefType: 'CL_ACCUM';
  credDefId: string;
  tag: string;
  value: {
    publicKeys: {
      accumKey: {
        z: string;
      };
    };
    maxCredNum: number;
    tailsLocation: string;
    tailsHash: string;
  };
}

export interface AnonCredsRevocationRegistryDefinitionWithMetadata {
  revRegDef: AnonCredsRevocationRegistryDefinition;
  hcsMetadata: { entriesTopicId: string };
}
