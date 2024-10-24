import { TopicMessageSubmitTransaction } from "@hashgraph/sdk";
import { DIDAddVerificationMethodMessage } from "./DIDAddVerificationMethodMessage";
import { LifecycleBuilder } from "../LifeCycleManager/Builder";
import { Publisher } from "../Publisher";

export const DIDAddVerificationMethodMessageHederaCSMLifeCycle =
  new LifecycleBuilder<DIDAddVerificationMethodMessage>()
    .pause()
    .signature()
    .callback(
      async (
        message: DIDAddVerificationMethodMessage,
        publisher: Publisher
      ) => {
        await publisher.publish(
          new TopicMessageSubmitTransaction()
            .setTopicId(message.topicId)
            .setMessage(message.payload)
            .freezeWith(publisher.client)
        );
      }
    )
    .callback(async (message: DIDAddVerificationMethodMessage) => {
      console.log("Message sent to Hedera Consensus Service");
      console.log("TopicID: ", message.topicId);
    })
    .catch((error: unknown) => {
      console.error("Error: ", error);
    });
