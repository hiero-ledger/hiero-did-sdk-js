import {
    Client,
    AccountId,
    PrivateKey,
    TopicCreateTransaction,
    TopicMessageSubmitTransaction,
    TopicMessageQuery,
    TopicId,
    TopicMessage,
    SubscriptionHandle
} from '@hashgraph/sdk';

let subscriptionHandle: SubscriptionHandle | null = null;
let receivedMessages: string[] = [];

export async function configureHederaClient(containerHost: string, port: number, operatorId: string, operatorKey: string): Promise<Client> {
    const client = Client.forNetwork({ [`${containerHost}:${port}`]: new AccountId(3) });
    const operatorPrivateKey = PrivateKey.fromString(operatorKey);
    client.setMirrorNetwork('local-node');
    client.setOperator(AccountId.fromString(operatorId), operatorPrivateKey);
    return client;
}

export async function createTopic(client: Client): Promise<TopicId> {
    const transactionResponse = await new TopicCreateTransaction().execute(client);
    const receipt = await transactionResponse.getReceipt(client);
    await new Promise((resolve) => setTimeout(resolve, 5000));
    return receipt.topicId!;
}

export async function sendMessageToTopic(client: Client, topicId: TopicId, messages: string[]): Promise<void> {
    for (const message of messages) {
        const transactionResponse = await new TopicMessageSubmitTransaction()
            .setTopicId(topicId)
            .setMessage(message)
            .execute(client);

        const receipt = await transactionResponse.getReceipt(client);
    }
}

export async function waitForMessagesWithRetry(retries: number, delay: number, expectedMessages: string[]): Promise<void> {
    let attempts = 0;

    while (attempts < retries) {
        if (receivedMessages.length >= expectedMessages.length) {
            return;
        }
        await new Promise((resolve) => setTimeout(resolve, delay));

        attempts++;
    }
}

export async function subscribeToHcsTopic(client: Client, topicId: string): Promise<void> {
    if (subscriptionHandle) {
        subscriptionHandle.unsubscribe();
        subscriptionHandle = null;
    }

    const topicQuery = new TopicMessageQuery().setTopicId(TopicId.fromString(topicId));
    subscriptionHandle = topicQuery.subscribe(
        client,
        null,
        (message: TopicMessage) => {
            const messageAsString = Buffer.from(message.contents).toString();
            receivedMessages.push(messageAsString);
        });

    await new Promise((resolve) => setTimeout(resolve, 5000));
}

export async function unsubscribeFromHcsTopic(): Promise<void> {
    if (subscriptionHandle) {
        subscriptionHandle.unsubscribe();
        subscriptionHandle = null;
    }
}

export function getReceivedMessages(): string[] {
    return receivedMessages;
}

export function purgeReceivedMessages(): void {
    receivedMessages = [];
}
