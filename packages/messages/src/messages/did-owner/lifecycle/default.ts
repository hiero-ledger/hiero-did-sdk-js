import {
  TopicCreateTransaction,
  TopicMessageSubmitTransaction,
} from '@hashgraph/sdk';
import { LifecycleBuilder } from '@swiss-digital-assets-institute/lifecycle';
import { DIDError, Publisher } from '@swiss-digital-assets-institute/core';
import { DIDOwnerMessage } from '../message';
import { checkDIDExists } from '../utils';
import { DIDOwnerMessageContext } from './context';

export const DIDOwnerMessageHederaDefaultLifeCycle = new LifecycleBuilder<
  DIDOwnerMessage,
  DIDOwnerMessageContext
>()
  .callback(
    'set-network',
    async (message: DIDOwnerMessage, publisher: Publisher) => {
      message.setNetwork(await publisher.network());
    },
  )
  .callback(
    'set-topic',
    async (message: DIDOwnerMessage, publisher: Publisher) => {
      if (message.hasTopicId) {
        return;
      }

      const publicKey = await publisher.publicKey();
      const response = await publisher.publish(
        new TopicCreateTransaction()
          .setAdminKey(publicKey)
          .setSubmitKey(publicKey),
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
  .callback(
    'check-did-existence',
    async (message: DIDOwnerMessage, _, context: DIDOwnerMessageContext) => {
      const isDIDExists = await checkDIDExists(
        message.did,
        context.topicReader,
      );

      if (isDIDExists) {
        throw new DIDError(
          'internalError',
          'DID already exists on the network',
        );
      }
    },
  )
  .signWithSigner('signature')
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
