import { Client, Transaction, TransactionReceipt } from "@hashgraph/sdk";
import { Publisher } from "./Publisher.type";

class LocalPublisher implements Publisher {
  constructor(public readonly client: Client) {}

  async publish(transaction: Transaction): Promise<TransactionReceipt> {
    const response = await transaction.execute(this.client);
    const receipt = await response.getReceipt(this.client);
    return receipt;
  }
}

export { LocalPublisher };
