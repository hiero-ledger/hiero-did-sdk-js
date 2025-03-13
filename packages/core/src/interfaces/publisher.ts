import { Transaction, TransactionReceipt, PublicKey } from '@hashgraph/sdk';
import { Network } from './network';

/**
 * Publisher is an entity that can publish Hedera transactions to the network.
 * The publisher is responsible for signing the transaction and submitting it to the network.
 */
export abstract class Publisher {
  /**
   * Get the network that the publisher is connected to.
   * @returns The network name.
   * @remarks The network is used to publish transactions.
   */
  abstract network(): Promise<Network> | Network;

  /**
   * Get the public key of the publisher.
   * @returns The public key.
   * @remarks The public key is used for Topic Admin and Submit Key.
   */
  abstract publicKey(): Promise<PublicKey> | PublicKey;

  /**
   * Publish a transaction to the network.
   * @param transaction The transaction to publish.
   * @returns The transaction receipt.
   */
  abstract publish(
    transaction: Transaction,
  ): Promise<TransactionReceipt> | TransactionReceipt;
}
