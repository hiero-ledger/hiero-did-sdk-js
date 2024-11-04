import { Publisher, Signer, Network } from '@hashgraph-did-sdk/core';
import { Client, PrivateKey } from '@hashgraph/sdk';

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

export interface Providers {
  /**
   * The client options used to create the Hedera client.
   * Used to create a InternalPublisher if the publisher is not provided.
   */
  clientOptions?: ClientOptions;

  /**
   * The Hedera client used to interact with the Hedera network.
   * Used to create a InternalPublisher if the publisher is not provided.
   */
  client?: Client;

  /**
   * The signer used to sign messages.
   */
  signer?: Signer;

  /**
   * The publisher used to publish transactions to the Hedera network.
   */
  publisher?: Publisher;
}
