import { TopicMessageSubmitTransaction } from '@hashgraph/sdk';
import { LifecycleBuilder } from '@hiero-did-sdk/lifecycle';
import { Publisher } from '@hiero-did-sdk/core';
import { DIDAddVerificationMethodMessage } from '../message';

export const DIDAddVerificationMethodMessageHederaDefaultLifeCycle =
  new LifecycleBuilder<DIDAddVerificationMethodMessage>()
    .signWithSigner('signature')
    .pause('pause')
    .callback('publish-message', async (message: DIDAddVerificationMethodMessage, publisher: Publisher) => {
      await publisher.publish(
        new TopicMessageSubmitTransaction().setTopicId(message.topicId).setMessage(message.payload)
      );
    });
