import { TopicMessageSubmitTransaction } from "@hashgraph/sdk";
import { DIDDeactivateMessage } from "./DIDDeactivateMessage";
import { LifecycleBuilder } from "../LifeCycleManager/Builder";
import { Publisher } from "../Publisher";

export const DIDDeactivateMessageHederaCSMLifeCycle =
  new LifecycleBuilder<DIDDeactivateMessage>()
    .pause()
    .signature()
    .callback(async (message: DIDDeactivateMessage, publisher: Publisher) => {
      await publisher.publish(
        new TopicMessageSubmitTransaction()
          .setTopicId(message.topicId)
          .setMessage(message.payload)
          .freezeWith(publisher.client)
      );
    })
    .callback(async (message: DIDDeactivateMessage) => {
      console.log("Message sent to Hedera Consensus Service");
      console.log("TopicID: ", message.topicId);
    })
    .catch((error: unknown) => {
      console.error("Error: ", error);
    });
