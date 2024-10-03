import { Client, Transaction, TransactionReceipt } from "@hashgraph/sdk";
import { Publisher } from "./Publisher.type";

class LocalPublisher implements Publisher {
  private _client: Client;

  constructor(client: Client) {
    this._client = client;
  }

  get client(): Client {
    return this._client;
  }

  async publish(transaction: Transaction): Promise<TransactionReceipt> {
    try {
      const response = await transaction.execute(this._client);
      const receipt = await response.getReceipt(this._client);
      return receipt;
    } catch (error) {
      console.error("Error publishing transaction:", error);
      throw error;
    }
  }
}

export { LocalPublisher };
