import { TopicMessageSubmitTransaction } from "@hashgraph/sdk";
import { DIDRemoveVerificationMethodMessage } from "./DIDRemoveVerificationMethodMessage";
import { LifecycleBuilder } from "../LifeCycleManager/Builder";
import { Publisher } from "../Publisher";

export const DIDRemoveVerificationMethodMessageHederaDefaultLifeCycle =
  new LifecycleBuilder<DIDRemoveVerificationMethodMessage>()
    .signWithSigner()
    .callback(
      async (
        message: DIDRemoveVerificationMethodMessage,
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
    .callback(async (message: DIDRemoveVerificationMethodMessage) => {
      console.log("Message sent to Hedera Consensus Service");
      console.log("TopicID: ", message.topicId);
    })
    .catch((error: unknown) => {
      console.error("Error: ", error);
    });
