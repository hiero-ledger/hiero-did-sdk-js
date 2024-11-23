export interface DIDOwnerEvent {
  DIDOwner: {
    id: string;
    type: string;
    controller: string;
    publicKeyMultibase?: string;
    publicKeyBase58?: string;
  };
}
