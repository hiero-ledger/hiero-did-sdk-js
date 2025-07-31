export type RelationShipProperties =
  | 'authentication'
  | 'assertionMethod'
  | 'keyAgreement'
  | 'capabilityInvocation'
  | 'capabilityDelegation';

export type VerificationMethodProperties = 'verificationMethod' | RelationShipProperties;
