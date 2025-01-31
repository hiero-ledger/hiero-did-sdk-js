import { TopicMessageSubmitTransaction } from '@hashgraph/sdk';
import { LifecycleBuilder } from '@swiss-digital-assets-institute/lifecycle';
import { Publisher } from '@swiss-digital-assets-institute/core';
import { DIDRemoveVerificationMethodMessage } from '../message';

export const DIDRemoveVerificationMethodMessageHederaCSMLifeCycle =
  new LifecycleBuilder<DIDRemoveVerificationMethodMessage>()
    .pause('pause-for-signature')
    .signature('signature')
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
