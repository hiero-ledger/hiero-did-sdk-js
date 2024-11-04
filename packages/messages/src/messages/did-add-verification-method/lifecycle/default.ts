import { TopicMessageSubmitTransaction } from '@hashgraph/sdk';
import { LifecycleBuilder } from '@hashgraph-did-sdk/lifecycle';
import { Publisher } from '@hashgraph-did-sdk/core';
import { DIDAddVerificationMethodMessage } from '../message';

export const DIDAddVerificationMethodMessageHederaDefaultLifeCycle =
  new LifecycleBuilder<DIDAddVerificationMethodMessage>()
    .signWithSigner()
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
