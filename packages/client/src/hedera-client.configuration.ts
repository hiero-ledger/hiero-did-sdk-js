import { AccountId } from '@hashgraph/sdk';

export const HEDERA_NETWORKS = ['mainnet', 'testnet', 'previewnet', 'local-node'] as const;

export type HederaNetwork = (typeof HEDERA_NETWORKS)[number];

export type HederaCustomNetwork = {
  name: string;
  nodes: {
    [key: string]: string | AccountId;
  };
  mirrorNodes?: string | string[] | undefined;
};

export interface NetworkConfig {
  network: HederaNetwork | HederaCustomNetwork;
  operatorId: string;
  operatorKey: string;
}

export interface HederaClientConfiguration {
  networks: NetworkConfig[];
}
