import { TopicMessageSubmitTransaction } from '@hashgraph/sdk';
import { LifecycleBuilder } from '@swiss-digital-assets-institute/lifecycle';
import { Publisher } from '@swiss-digital-assets-institute/core';
import { DIDRemoveServiceMessage } from '../message';

export const DIDRemoveServiceMessageHederaCSMLifeCycle =
  new LifecycleBuilder<DIDRemoveServiceMessage>()
    .pause('pause')
    .signature('signature')
    .callback(
      'publish-message',
      async (message: DIDRemoveServiceMessage, publisher: Publisher) => {
        await publisher.publish(
          new TopicMessageSubmitTransaction()
            .setTopicId(message.topicId)
            .setMessage(message.payload),
        );
      },
    );
