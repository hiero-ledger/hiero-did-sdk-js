export const TopicCreateTransactionMock = jest.fn();
export const TopicMessageSubmitTransactionMock = jest.fn();

jest.mock('@hashgraph/sdk', () => {
  const actual: object = jest.requireActual('@hashgraph/sdk');
  const ClientMock = {
    forName: jest.fn().mockReturnThis(),
    setOperator: jest.fn().mockReturnThis(),
    close: jest.fn(),
    ledgerId: {
      isMainnet: jest.fn().mockReturnValue(false),
      isTestnet: jest.fn().mockReturnValue(true),
      isPreviewnet: jest.fn().mockReturnValue(false),
      isLocalNode: jest.fn().mockReturnValue(false),
    },
    operatorPublicKey: 'test-operator-public-key',
  };

  return {
    ...actual,
    Client: ClientMock,
    // eslint-disable-next-line @typescript-eslint/no-unsafe-return
    TopicCreateTransaction: jest.fn(() => TopicCreateTransactionMock()),
    TopicMessageSubmitTransaction: jest.fn(() =>
      // eslint-disable-next-line @typescript-eslint/no-unsafe-return
      TopicMessageSubmitTransactionMock(),
    ),
  };
});

export const MessageAwaiterForMessagesMock = jest.fn().mockReturnThis();
export const MessageAwaiterConstructorMock = jest.fn();
export const MessageAwaiterWaitMock = jest.fn().mockResolvedValue(void 0);
export const MessageAwaiterWithTimeoutMock = jest.fn().mockReturnThis();
jest.mock('../src/shared/message-awaiter.ts', () => {
  return {
    MessageAwaiter: jest.fn().mockImplementation((...args) => {
      MessageAwaiterConstructorMock(args);
      return {
        forMessages: MessageAwaiterForMessagesMock,
        setStartsAt: jest.fn().mockReturnThis(),
        withTimeout: MessageAwaiterWithTimeoutMock,
        withWaitForTopic: jest.fn().mockReturnThis(),
        wait: MessageAwaiterWaitMock,
      };
    }),
  };
});
