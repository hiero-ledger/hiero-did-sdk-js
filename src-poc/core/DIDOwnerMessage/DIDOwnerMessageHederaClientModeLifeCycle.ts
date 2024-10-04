import {
  TopicCreateTransaction,
  TopicMessageSubmitTransaction,
} from "@hashgraph/sdk";
import { Publisher } from "../Publisher";
import { DIDOwnerMessage } from "./DIDOwnerMessage";
import { Signer } from "../Signer";

const clearData = (data: any) => {
  return JSON.stringify({
    ...data,
    signer: undefined,
    publisher: undefined,
    publicKey: data.publicKey.toStringDer(),
    eventBytes: data.eventBytes ? "<bytes>" : undefined,
    signature: data.signature ? "<bytes>" : undefined,
  });
};

class ClientModeLifeCycleManager {
  async process(
    message: DIDOwnerMessage,
    signer: Signer,
    publisher: Publisher,
    signature?: Uint8Array
  ) {
    if (message.stage === "initialize") {
      await this.initialization(message, signer, publisher);
      return message.eventBytes;
    }

    if (!signature) {
      throw new Error("Signature is required for signing stage");
    }

    await this.signing(message, signer, publisher, signature);
    await this.publishing(message, signer, publisher);
  }

  private async initialization(
    message: DIDOwnerMessage,
    signer: Signer,
    publisher: Publisher
  ) {
    const data = message.initializeData;
    console.log(`[DIDOwnerMessage] Pre creation data: ${clearData(data)}`);

    const response = await publisher.publish(
      new TopicCreateTransaction()
        .setAdminKey(data.publicKey)
        .setSubmitKey(data.publicKey)
        .freezeWith(publisher.client)
    );

    const topicId = response.topicId?.toString();

    if (!topicId) {
      throw new Error("Failed to create a topic");
    }

    await message.initialize({
      topicId,
    });
  }
  private async signing(
    message: DIDOwnerMessage,
    signer: Signer,
    publisher: Publisher,
    signature: Uint8Array
  ) {
    await message.signing({
      signature,
    });
  }

  private async publishing(
    message: DIDOwnerMessage,
    signer: Signer,
    publisher: Publisher
  ) {
    const data = message.publishingData;
    console.log(`[DIDOwnerMessage] Post creation data: ${clearData(data)}`);

    await publisher.publish(
      new TopicMessageSubmitTransaction()
        .setTopicId(data.topicId)
        .setMessage(data.message)
        .freezeWith(publisher.client)
    );

    await message.publishing();
  }
}

export const ClientModeLifeCycleManagerInstance =
  new ClientModeLifeCycleManager();
