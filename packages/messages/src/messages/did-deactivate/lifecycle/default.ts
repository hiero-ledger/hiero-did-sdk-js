import { TopicMessageSubmitTransaction } from '@hashgraph/sdk';
import { LifecycleBuilder } from '@swiss-digital-assets-institute/lifecycle';
import { Publisher } from '@swiss-digital-assets-institute/core';
import { DIDDeactivateMessage } from '../message';

export const DIDDeactivateMessageHederaDefaultLifeCycle =
  new LifecycleBuilder<DIDDeactivateMessage>()
    .signWithSigner()
    .pause()
    .callback(async (message: DIDDeactivateMessage, publisher: Publisher) => {
      await publisher.publish(
        new TopicMessageSubmitTransaction()
          .setTopicId(message.topicId)
          .setMessage(message.payload),
      );
    });
