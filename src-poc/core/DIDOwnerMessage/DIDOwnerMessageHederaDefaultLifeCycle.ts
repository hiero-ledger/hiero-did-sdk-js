import {
  TopicCreateTransaction,
  TopicMessageSubmitTransaction,
} from "@hashgraph/sdk";
import {
  DIDMessageLifeCycleManager,
  HookFunction,
  Hooks,
} from "../DIDMessage/DIDMessageLifeCycleManager";
import { DIDOwnerMessage } from "./DIDOwnerMessage";
import {
  DIDOwnerMessageInitializationData,
  DIDOwnerMessageInitializationResult,
  DIDOwnerMessageSigningData,
  DIDOwnerMessageSigningResult,
  DIDOwnerMessagePublishingData,
  DIDOwnerMessagePublishingResult,
} from "./DIDOwnerMessageLifeCycle";

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

type DIDOwnerHooks = Hooks<
  HookFunction<
    DIDOwnerMessageInitializationData,
    DIDOwnerMessageInitializationResult
  >,
  HookFunction<DIDOwnerMessageSigningData, DIDOwnerMessageSigningResult>,
  HookFunction<DIDOwnerMessagePublishingData, DIDOwnerMessagePublishingResult>
>;

export const DIDOwnerMessageHederaDefaultLifeCycle: any =
  new DIDMessageLifeCycleManager<DIDOwnerMessage, DIDOwnerHooks>({
    initialization: async (data) => {
      console.log(`[DIDOwnerMessage] Pre creation data: ${clearData(data)}`);

      const response = await data.publisher.publish(
        new TopicCreateTransaction()
          .setAdminKey(data.publicKey)
          .setSubmitKey(data.publicKey)
          .freezeWith(data.publisher.client)
      );

      const topicId = response.topicId?.toString();

      if (!topicId) {
        throw new Error("Failed to create a topic");
      }

      return {
        topicId: topicId,
      };
    },
    signing: async (data) => {
      const signature = await data.signer.sign(data.eventBytes);

      return {
        signature,
      };
    },
    publication: async (data) => {
      console.log(`[DIDOwnerMessage] Post creation data: ${clearData(data)}`);

      await data.publisher.publish(
        new TopicMessageSubmitTransaction()
          .setTopicId(data.topicId)
          .setMessage(data.message)
          .freezeWith(data.publisher.client)
      );
    },
  });
