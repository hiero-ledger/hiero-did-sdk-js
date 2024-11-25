import { TopicMessageSubmitTransaction } from '@hashgraph/sdk';
import { LifecycleBuilder } from '@hashgraph-did-sdk/lifecycle';
import { Publisher } from '@hashgraph-did-sdk/core';
import { DIDRemoveServiceMessage } from '../message';

export const DIDRemoveServiceMessageHederaDefaultLifeCycle =
  new LifecycleBuilder<DIDRemoveServiceMessage>()
    .signWithSigner()
    .callback(
      async (message: DIDRemoveServiceMessage, publisher: Publisher) => {
        await publisher.publish(
          new TopicMessageSubmitTransaction()
            .setTopicId(message.topicId)
            .setMessage(message.payload),
        );
      },
    );
