import { RelationShipProperties } from '@swiss-digital-assets-institute/core';

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
