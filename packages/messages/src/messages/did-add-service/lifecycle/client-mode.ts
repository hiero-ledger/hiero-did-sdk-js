import { TopicMessageSubmitTransaction } from '@hashgraph/sdk';
import { LifecycleBuilder } from '@hashgraph-did-sdk/lifecycle';
import { Publisher } from '@hashgraph-did-sdk/core';
import { DIDAddServiceMessage } from '../message';

export const DIDAddServiceMessageHederaCSMLifeCycle =
  new LifecycleBuilder<DIDAddServiceMessage>()
    .pause()
    .signature()
    .callback(async (message: DIDAddServiceMessage, publisher: Publisher) => {
      await publisher.publish(
        new TopicMessageSubmitTransaction()
          .setTopicId(message.topicId)
          .setMessage(message.payload),
      );
    });
