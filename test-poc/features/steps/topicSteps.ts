import { Given, When, Then } from '@cucumber/cucumber';
import { configureHederaClient, createTopic, sendMessageToTopic, subscribeToHcsTopic, getReceivedMessages, unsubscribeFromHcsTopic, waitForMessagesWithRetry } from '../../utils/hederaUtils';
import { expect } from 'expect';
import { TopicId } from '@hashgraph/sdk';
import NodeClient from '@hashgraph/sdk/lib/client/NodeClient';

let client: NodeClient;
let topicId: TopicId;

Given('a Hedera client is configured', async () => {
    client = await configureHederaClient('localhost', 50211, '0.0.2', '302e020100300506032b65700422042091132178e72057a1d7528025956fe39b0b847f200ab59b2fdd367017f3087137');
});

When('a new topic is created', async () => {
    topicId = await createTopic(client);
    expect(topicId).not.toBeNull();
    await subscribeToHcsTopic(client, topicId!.toString());
});

When('messages {string} and {string} are sent to the topic', async (message1, message2) => {
    await sendMessageToTopic(client, topicId, [message1, message2]);
});

Then('the messages {string} and {string} should be received', async (message1, message2) => {
    await waitForMessagesWithRetry(15, 1000, [message1, message2]);
    const receivedMessages = getReceivedMessages();
    expect(receivedMessages).toEqual([message1, message2]);
    await unsubscribeFromHcsTopic();
    client.close();
});
