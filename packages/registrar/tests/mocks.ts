import { vi, type Mock } from 'vitest';

const hoisted = vi.hoisted(() => ({
  TopicCreateTransactionMock: vi.fn(),
  TopicMessageSubmitTransactionMock: vi.fn(),
  ClientForNameMock: vi.fn(),
  ClientSetOperatorMock: vi.fn(),
  ClientCloseMock: vi.fn(),
}));

export const TopicCreateTransactionMock: Mock = hoisted.TopicCreateTransactionMock;
export const TopicMessageSubmitTransactionMock: Mock = hoisted.TopicMessageSubmitTransactionMock;
export const ClientForNameMock: Mock = hoisted.ClientForNameMock;
export const ClientSetOperatorMock: Mock = hoisted.ClientSetOperatorMock;
export const ClientCloseMock: Mock = hoisted.ClientCloseMock;

vi.mock('@hashgraph/sdk', async () => {
  const actual = await vi.importActual<typeof import('@hashgraph/sdk')>('@hashgraph/sdk');
  const ClientMock: any = {
    ledgerId: {
      isMainnet: vi.fn().mockReturnValue(false),
      isTestnet: vi.fn().mockReturnValue(true),
      isPreviewnet: vi.fn().mockReturnValue(false),
      isLocalNode: vi.fn().mockReturnValue(false),
    },
    operatorPublicKey: 'test-operator-public-key',
    close: ClientCloseMock,
  };

  // Setup default return values before assigning to ClientMock
  ClientForNameMock.mockReturnValue(ClientMock);
  ClientSetOperatorMock.mockReturnValue(ClientMock);

  ClientMock.forName = ClientForNameMock;
  ClientMock.setOperator = ClientSetOperatorMock;

  return {
    ...actual,
    Client: ClientMock,
    TopicCreateTransaction: TopicCreateTransactionMock,
    TopicMessageSubmitTransaction: TopicMessageSubmitTransactionMock,
  };
});

export const MessageAwaiterForMessagesMock: Mock = vi.fn().mockReturnThis();
export const MessageAwaiterConstructorMock: Mock = vi.fn();
export const MessageAwaiterWaitMock: Mock = vi.fn().mockResolvedValue(void 0);
export const MessageAwaiterWithTimeoutMock: Mock = vi.fn().mockReturnThis();
vi.mock('../src/shared/message-awaiter.ts', () => {
  return {
    MessageAwaiter: vi.fn().mockImplementation(function(...args) {
      MessageAwaiterConstructorMock(...args);
      return {
        forMessages: MessageAwaiterForMessagesMock,
        setStartsAt: vi.fn().mockReturnThis(),
        withTimeout: MessageAwaiterWithTimeoutMock,
        withWaitForTopic: vi.fn().mockReturnThis(),
        wait: MessageAwaiterWaitMock,
      };
    }),
  };
});
