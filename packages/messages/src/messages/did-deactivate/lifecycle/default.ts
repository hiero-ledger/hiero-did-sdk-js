import { TopicMessageSubmitTransaction } from '@hashgraph/sdk';
import { LifecycleBuilder } from '@hashgraph-did-sdk/lifecycle';
import { Publisher } from '@hashgraph-did-sdk/core';
import { DIDDeactivateMessage } from '../message';

export const DIDDeactivateMessageHederaDefaultLifeCycle =
  new LifecycleBuilder<DIDDeactivateMessage>()
    .signWithSigner()
    .callback(async (message: DIDDeactivateMessage, publisher: Publisher) => {
      await publisher.publish(
        new TopicMessageSubmitTransaction()
          .setTopicId(message.topicId)
          .setMessage(message.payload),
      );
    });
