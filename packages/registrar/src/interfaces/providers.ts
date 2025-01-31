import { Publisher, Signer } from '@swiss-digital-assets-institute/core';
import { Client } from '@hashgraph/sdk';
import { ClientOptions } from './client-options';

export interface PublisherProviders {
  /**
   * The client options used to create the Hedera client.
   * Used to create a Internal Publisher if the publisher is not provided.
   */
  clientOptions?: ClientOptions;

  /**
   * The Hedera client used to interact with the Hedera network.
   * Used to create a Internal Publisher if the publisher is not provided.
   */
  client?: Client;

  /**
   * The publisher used to publish transactions to the Hedera network.
   */
  publisher?: Publisher;
}

export interface SignerProviders {
  /**
   * The signer used to sign messages.
   */
  signer?: Signer;
}

export type Providers = PublisherProviders & SignerProviders;
