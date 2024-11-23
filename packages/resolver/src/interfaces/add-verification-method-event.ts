export interface AddVerificationMethodEvent {
  VerificationMethod: {
    id: string;
    type: string;
    controller: string;
    publicKeyMultibase?: string;
    publicKeyBase58?: string;
  };
}
