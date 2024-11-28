import { TopicMessageSubmitTransaction } from '@hashgraph/sdk';
import { LifecycleBuilder } from '@swiss-digital-assets-institute/lifecycle';
import { Publisher } from '@swiss-digital-assets-institute/core';
import { DIDAddVerificationMethodMessage } from '../message';

export const DIDAddVerificationMethodMessageHederaCSMLifeCycle =
  new LifecycleBuilder<DIDAddVerificationMethodMessage>()
    .pause()
    .signature()
    .callback(
      async (
        message: DIDAddVerificationMethodMessage,
        publisher: Publisher,
      ) => {
        await publisher.publish(
          new TopicMessageSubmitTransaction()
            .setTopicId(message.topicId)
            .setMessage(message.payload),
        );
      },
    );
