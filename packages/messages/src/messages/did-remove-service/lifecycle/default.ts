import { TopicMessageSubmitTransaction } from '@hashgraph/sdk';
import { LifecycleBuilder } from '@hiero-did-sdk/lifecycle';
import { Publisher } from '@hiero-did-sdk/core';
import { DIDRemoveServiceMessage } from '../message';

export const DIDRemoveServiceMessageHederaDefaultLifeCycle = new LifecycleBuilder<DIDRemoveServiceMessage>()
  .signWithSigner('signature')
  .pause('pause')
  .callback('publish-message', async (message: DIDRemoveServiceMessage, publisher: Publisher) => {
    await publisher.publish(
      new TopicMessageSubmitTransaction().setTopicId(message.topicId).setMessage(message.payload)
    );
  });
