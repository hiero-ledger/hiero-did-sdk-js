import { Network } from '@hiero-did-sdk/core';
import { Client, PrivateKey } from '@hashgraph/sdk';

export function randomClient(network: Network = 'testnet'): Client {
  return Client.forName(network).setOperator('0.0.12345', PrivateKey.generate());
}
