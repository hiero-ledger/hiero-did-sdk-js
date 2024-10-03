import { Client, Transaction, TransactionReceipt } from "@hashgraph/sdk";

export abstract class Publisher {
  abstract get client(): Client;
  abstract publish(
    transaction: Transaction
  ): Promise<TransactionReceipt> | TransactionReceipt;
}
