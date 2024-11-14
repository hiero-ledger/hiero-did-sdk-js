import { Publisher, Signer } from '@hashgraph-did-sdk/core';
import { Client } from '@hashgraph/sdk';
import { ClientOptions } from './client-options';

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
