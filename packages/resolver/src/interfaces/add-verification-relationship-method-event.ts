import { RelationShipProperties } from '@hiero-did-sdk/core';

export interface AddVerificationRelationshipMethodEvent {
  VerificationRelationship: {
    id: string;
    type: string;
    relationshipType: RelationShipProperties;
    controller: string;
    publicKeyMultibase?: string;
    publicKeyBase58?: string;
  };
}
