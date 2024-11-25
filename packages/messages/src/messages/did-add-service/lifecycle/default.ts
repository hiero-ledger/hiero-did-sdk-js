import { TopicMessageSubmitTransaction } from '@hashgraph/sdk';
import { LifecycleBuilder } from '@hashgraph-did-sdk/lifecycle';
import { Publisher } from '@hashgraph-did-sdk/core';
import { DIDAddServiceMessage } from '../message';

export const DIDAddServiceMessageHederaDefaultLifeCycle =
  new LifecycleBuilder<DIDAddServiceMessage>()
    .signWithSigner()
    .callback(async (message: DIDAddServiceMessage, publisher: Publisher) => {
      await publisher.publish(
        new TopicMessageSubmitTransaction()
          .setTopicId(message.topicId)
          .setMessage(message.payload),
      );
    });
