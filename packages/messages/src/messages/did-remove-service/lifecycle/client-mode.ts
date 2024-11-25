import { TopicMessageSubmitTransaction } from '@hashgraph/sdk';
import { LifecycleBuilder } from '@hashgraph-did-sdk/lifecycle';
import { Publisher } from '@hashgraph-did-sdk/core';
import { DIDRemoveServiceMessage } from '../message';

export const DIDRemoveServiceMessageHederaCSMLifeCycle =
  new LifecycleBuilder<DIDRemoveServiceMessage>()
    .pause()
    .signature()
    .callback(
      async (message: DIDRemoveServiceMessage, publisher: Publisher) => {
        await publisher.publish(
          new TopicMessageSubmitTransaction()
            .setTopicId(message.topicId)
            .setMessage(message.payload),
        );
      },
    );
