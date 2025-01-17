import {
  Client,
  PublicKey,
  Transaction,
  TransactionReceipt,
} from '@hashgraph/sdk';
import {
  Network,
  Publisher as BasePublisher,
  DIDError,
} from '@swiss-digital-assets-institute/core';

/**
 * Internal Publisher is an implementation of the Publisher interface.
 * It uses the Hedera Client class to publish transactions to the network.
 */
export class Publisher implements BasePublisher {
  /**
   * Create a new Publisher instance.
   * @param client The Hedera Client instance.
   */
  constructor(public readonly client: Client) {
    if (!client) {
      throw new DIDError(
        'invalidArgument',
        'Hashgraph SDK Client is required to create a Publisher',
      );
    }

    if (!client.ledgerId) {
      throw new DIDError(
        'invalidArgument',
        'Hashgraph SDK Client must be configured with a network',
      );
    }

    if (!client.operatorPublicKey) {
      throw new DIDError(
        'invalidArgument',
        'Hashgraph SDK Client must be configured with an operator account',
      );
    }
  }

  /**
   * Name of the network that the publisher is connected to.
   * @returns The network name.
   * @throws Error if the network is unknown.
   * @remarks The network is used to publish transactions.
   */
  network(): Network {
    const ledgerId = this.client.ledgerId;

    if (ledgerId.isMainnet()) {
      return 'mainnet';
    }

    if (ledgerId.isTestnet()) {
      return 'testnet';
    }

    if (ledgerId.isPreviewnet()) {
      return 'previewnet';
    }

    if (ledgerId.isLocalNode()) {
      return 'local-node';
    }

    throw new DIDError(
      'internalError',
      `Unknown network, ledger ID: ${ledgerId.toString()}`,
    );
  }

  /**
   * Get the public key of the publisher.
   * @returns The public key.
   * @remarks The public key is in base58 format.
   * @remarks The public key is used for Topic Admin and Submit Key.
   */
  publicKey(): PublicKey {
    const publicKey = this.client.operatorPublicKey;
    return publicKey;
  }

  /**
   * Publish a transaction to the network using the Hedera Client.
   * @param transaction The transaction to publish.
   * @returns The transaction receipt.
   */
  async publish(transaction: Transaction): Promise<TransactionReceipt> {
    const response = await transaction.execute(this.client);
    const receipt = await response.getReceipt(this.client);
    return receipt;
  }
}
