import { TopicMessageSubmitTransaction } from '@hashgraph/sdk';
import { LifecycleBuilder } from '@hiero-did-sdk/lifecycle';
import { Publisher } from '@hiero-did-sdk/core';
import { DIDDeactivateMessage } from '../message';

export const DIDDeactivateMessageHederaCSMLifeCycle = new LifecycleBuilder<DIDDeactivateMessage>()
  .pause('pause-for-signature')
  .signature('signature')
  .pause('pause')
  .callback('publish-message', async (message: DIDDeactivateMessage, publisher: Publisher) => {
    await publisher.publish(
      new TopicMessageSubmitTransaction().setTopicId(message.topicId).setMessage(message.payload)
    );
  });
