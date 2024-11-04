import {
  TopicCreateTransaction,
  TopicMessageSubmitTransaction,
} from '@hashgraph/sdk';
import { LifecycleBuilder } from '@hashgraph-did-sdk/lifecycle';
import { Publisher } from '@hashgraph-did-sdk/core';
import { DIDOwnerMessage } from '../message';

export const DIDOwnerMessageHederaDefaultLifeCycle =
  new LifecycleBuilder<DIDOwnerMessage>()
    .callback((message: DIDOwnerMessage, publisher: Publisher) => {
      message.setNetwork(publisher.network());
    })
    .callback(async (message: DIDOwnerMessage, publisher: Publisher) => {
      if (message.hasTopicId) {
        return;
      }

      const response = await publisher.publish(
        new TopicCreateTransaction()
          .setAdminKey(publisher.publicKey())
          .setSubmitKey(publisher.publicKey()),
      );

      const topicId = response.topicId?.toString();

      if (!topicId) {
        throw new Error('Topic ID is missing');
      }

      message.setTopicId(topicId);
    })
    .signWithSigner()
    .callback(async (message: DIDOwnerMessage, publisher: Publisher) => {
      await publisher.publish(
        new TopicMessageSubmitTransaction()
          .setTopicId(message.topicId)
          .setMessage(message.payload),
      );
    });
