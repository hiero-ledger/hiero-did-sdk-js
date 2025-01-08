import { TopicMessageSubmitTransaction } from '@hashgraph/sdk';
import { LifecycleBuilder } from '@swiss-digital-assets-institute/lifecycle';
import { Publisher } from '@swiss-digital-assets-institute/core';
import { DIDAddServiceMessage } from '../message';

export const DIDAddServiceMessageHederaDefaultLifeCycle =
  new LifecycleBuilder<DIDAddServiceMessage>()
    .signWithSigner()
    .pause()
    .callback(async (message: DIDAddServiceMessage, publisher: Publisher) => {
      await publisher.publish(
        new TopicMessageSubmitTransaction()
          .setTopicId(message.topicId)
          .setMessage(message.payload),
      );
    });
