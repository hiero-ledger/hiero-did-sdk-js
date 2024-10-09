import {
  TopicCreateTransaction,
  TopicMessageSubmitTransaction,
} from "@hashgraph/sdk";
import { DIDOwnerMessage } from "./DIDOwnerMessage";
import { LifecycleBuilder } from "../LifeCycleManager/Builder";
import { Publisher } from "../Publisher";

export const DIDOwnerMessageHederaDefaultLifeCycle =
  new LifecycleBuilder<DIDOwnerMessage>()
    .callback(async (message: DIDOwnerMessage, publisher: Publisher) => {
      const response = await publisher.publish(
        new TopicCreateTransaction()
          .setAdminKey(publisher.client.operatorPublicKey!)
          .setSubmitKey(publisher.client.operatorPublicKey!)
          .freezeWith(publisher.client)
      );

      const topicId = response.topicId?.toString();

      if (!topicId) {
        throw new Error("Topic ID is missing");
      }

      message.setTopicId(topicId);
    })
    .signWithSigner()
    .callback(async (message: DIDOwnerMessage, publisher: Publisher) => {
      await publisher.publish(
        new TopicMessageSubmitTransaction()
          .setTopicId(message.topicId ?? "")
          .setMessage(message.messagePayload)
          .freezeWith(publisher.client)
      );
    })
    .callback(async (message: DIDOwnerMessage) => {
      console.log("Message sent to Hedera Consensus Service");
      console.log("TopicID: ", message.topicId);
    })
    .catch((error: unknown) => {
      console.error("Error: ", error);
    });
