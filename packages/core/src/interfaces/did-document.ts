export interface VerificationMethodBase58 {
  id: string;
  type: 'Ed25519VerificationKey2018';
  controller: string;
  publicKeyBase58: string;
}

export interface VerificationMethodMultibase {
  id: string;
  type: 'Ed25519VerificationKey2020';
  controller: string;
  publicKeyMultibase: string;
}

export type VerificationMethod =
  | VerificationMethodBase58
  | VerificationMethodMultibase;

export interface ServiceEndpoint {
  id: string;
  type: string;
  serviceEndpoint: string;
}

export type KeyCapabilityMethod = string | VerificationMethod;

export interface DIDDocument {
  id: string;
  controller: string;
  verificationMethod: VerificationMethod[];
  service?: ServiceEndpoint[];
  authentication?: KeyCapabilityMethod[];
  assertionMethod?: KeyCapabilityMethod[];
  keyAgreement?: KeyCapabilityMethod[];
  capabilityInvocation?: KeyCapabilityMethod[];
  capabilityDelegation?: KeyCapabilityMethod[];
}

export interface JsonLdDIDDocument extends DIDDocument {
  '@context': string | string[];
}
