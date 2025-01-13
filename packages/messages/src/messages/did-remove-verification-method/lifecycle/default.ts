import { TopicMessageSubmitTransaction } from '@hashgraph/sdk';
import { LifecycleBuilder } from '@swiss-digital-assets-institute/lifecycle';
import { Publisher } from '@swiss-digital-assets-institute/core';
import { DIDRemoveVerificationMethodMessage } from '../message';

export const DIDRemoveVerificationMethodMessageHederaDefaultLifeCycle =
  new LifecycleBuilder<DIDRemoveVerificationMethodMessage>()
    .signWithSigner('signature')
    .pause('pause')
    .callback(
      'publish-message',
      async (
        message: DIDRemoveVerificationMethodMessage,
        publisher: Publisher,
      ) => {
        await publisher.publish(
          new TopicMessageSubmitTransaction()
            .setTopicId(message.topicId)
            .setMessage(message.payload),
        );
      },
    );
