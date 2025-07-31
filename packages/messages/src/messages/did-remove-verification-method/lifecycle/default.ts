import { TopicMessageSubmitTransaction } from '@hashgraph/sdk';
import { LifecycleBuilder } from '@hiero-did-sdk/lifecycle';
import { Publisher } from '@hiero-did-sdk/core';
import { DIDRemoveVerificationMethodMessage } from '../message';

export const DIDRemoveVerificationMethodMessageHederaDefaultLifeCycle =
  new LifecycleBuilder<DIDRemoveVerificationMethodMessage>()
    .signWithSigner('signature')
    .pause('pause')
    .callback('publish-message', async (message: DIDRemoveVerificationMethodMessage, publisher: Publisher) => {
      await publisher.publish(
        new TopicMessageSubmitTransaction().setTopicId(message.topicId).setMessage(message.payload)
      );
    });
