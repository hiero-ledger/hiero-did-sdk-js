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

export type JsonLdVerificationMethod = VerificationMethod & {
  '@context'?: string | string[];
};

export type ServiceEndpoint = string;

export interface Service {
  id: string;
  type: string;
  serviceEndpoint: ServiceEndpoint;
}

export interface JsonLdService extends Service {
  '@context'?: string | string[];
}

export type KeyCapabilityMethod = string | VerificationMethod;

export interface DIDDocument {
  id: string;
  controller: string;
  verificationMethod: VerificationMethod[];
  service?: Service[];
  authentication?: KeyCapabilityMethod[];
  assertionMethod?: KeyCapabilityMethod[];
  keyAgreement?: KeyCapabilityMethod[];
  capabilityInvocation?: KeyCapabilityMethod[];
  capabilityDelegation?: KeyCapabilityMethod[];
}

export interface JsonLdDIDDocument extends DIDDocument {
  '@context': string | string[];
}

export type DIDDocumentCbor = Uint8Array;

export interface DIDDocumentMetadata {
  created?: string;
  updated?: string;
  deactivated?: boolean;
}

export interface DIDResolutionMetadata {
  contentType: 'application/ld+json;profile="https://w3id.org/did-resolution"';
  retrieved?: string;
}

export interface DIDResolution {
  didDocument: JsonLdDIDDocument;
  didDocumentMetadata: DIDDocumentMetadata;
  didResolutionMetadata: DIDResolutionMetadata;
}

export interface DIDDereferenceResolution {
  contentStream: JsonLdService | JsonLdVerificationMethod | ServiceEndpoint;
  dereferencingMetadata: DIDDocumentMetadata;
  contentMetadata: DIDResolutionMetadata;
}
