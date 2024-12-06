import { Network } from '@swiss-digital-assets-institute/core';
import { PrivateKey } from '@hashgraph/sdk';

export interface ClientOptions {
  /**
   * The operator private key.
   * Can be a string or a PrivateKey object.
   */
  privateKey: string | PrivateKey;

  /**
   * The operator account ID.
   */
  accountId: string;

  /**
   * The network to connect to (mainnet, testnet, previewnet).
   */
  network: Network;
}
