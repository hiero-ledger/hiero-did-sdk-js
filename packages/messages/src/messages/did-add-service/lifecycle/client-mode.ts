import { TopicMessageSubmitTransaction } from '@hashgraph/sdk';
import { LifecycleBuilder } from '@swiss-digital-assets-institute/lifecycle';
import { Publisher } from '@swiss-digital-assets-institute/core';
import { DIDAddServiceMessage } from '../message';

export const DIDAddServiceMessageHederaCSMLifeCycle =
  new LifecycleBuilder<DIDAddServiceMessage>()
    .pause('pause-for-signature')
    .signature('signature')
    .pause('pause')
    .callback(
      'publish-message',
      async (message: DIDAddServiceMessage, publisher: Publisher) => {
        await publisher.publish(
          new TopicMessageSubmitTransaction()
            .setTopicId(message.topicId)
            .setMessage(message.payload),
        );
      },
    );
