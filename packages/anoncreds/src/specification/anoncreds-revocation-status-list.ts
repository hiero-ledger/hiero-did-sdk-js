export interface AnonCredsRevocationStatusList {
  issuerId: string;
  revRegDefId: string;
  revocationList: Array<number>;
  currentAccumulator: string;
  timestamp: number;
}
