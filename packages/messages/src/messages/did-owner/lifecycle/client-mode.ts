import {
  TopicCreateTransaction,
  TopicMessageSubmitTransaction,
} from '@hashgraph/sdk';
import { LifecycleBuilder } from '@swiss-digital-assets-institute/lifecycle';
import { DIDError, Publisher } from '@swiss-digital-assets-institute/core';
import { DIDOwnerMessage } from '../message';
import { checkDIDExists } from '../utils';

export const DIDOwnerMessageHederaCSMLifeCycle =
  new LifecycleBuilder<DIDOwnerMessage>()
    .callback(
      'set-network',
      (message: DIDOwnerMessage, publisher: Publisher) => {
        message.setNetwork(publisher.network());
      },
    )
    .callback(
      'set-topic',
      async (message: DIDOwnerMessage, publisher: Publisher) => {
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
          throw new DIDError(
            'internalError',
            `Failed to create topic, transaction status: ${response.status.toString()}`,
          );
        }

        message.setTopicId(topicId);
      },
    )
    .callback('check-did-existence', async (message: DIDOwnerMessage) => {
      const isDIDExists = await checkDIDExists(message.did);

      if (isDIDExists) {
        throw new DIDError(
          'internalError',
          'DID already exists on the network',
        );
      }
    })
    .pause('pause-for-signature')
    .signature('signature')
    .pause('pause')
    .callback(
      'publish-message',
      async (message: DIDOwnerMessage, publisher: Publisher) => {
        await publisher.publish(
          new TopicMessageSubmitTransaction()
            .setTopicId(message.topicId)
            .setMessage(message.payload),
        );
      },
    );
