export interface AnonCredsCredentialDefinition {
  issuerId: string;
  schemaId: string;
  type: 'CL';
  tag: string;
  value: {
    primary: Record<string, unknown>;
    revocation?: unknown;
  };
}
