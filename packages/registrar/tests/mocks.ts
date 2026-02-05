import { vi } from 'vitest';

export const TopicCreateTransactionMock = vi.fn();
export const TopicMessageSubmitTransactionMock = vi.fn();

vi.mock('@hashgraph/sdk', () => {
  const actual: object = vi.importActual('@hashgraph/sdk');
  const ClientMock = {
    forName: vi.fn().mockReturnThis(),
    setOperator: vi.fn().mockReturnThis(),
    close: vi.fn(),
    ledgerId: {
      isMainnet: vi.fn().mockReturnValue(false),
      isTestnet: vi.fn().mockReturnValue(true),
      isPreviewnet: vi.fn().mockReturnValue(false),
      isLocalNode: vi.fn().mockReturnValue(false),
    },
    operatorPublicKey: 'test-operator-public-key',
  };

  return {
    ...actual,
    Client: ClientMock,
    // eslint-disable-next-line @typescript-eslint/no-unsafe-return
    TopicCreateTransaction: vi.fn(() => TopicCreateTransactionMock()),
    TopicMessageSubmitTransaction: vi.fn(() =>
      // eslint-disable-next-line @typescript-eslint/no-unsafe-return
      TopicMessageSubmitTransactionMock()
    ),
  };
});

export const MessageAwaiterForMessagesMock = vi.fn().mockReturnThis();
export const MessageAwaiterConstructorMock = vi.fn();
export const MessageAwaiterWaitMock = vi.fn().mockResolvedValue(void 0);
export const MessageAwaiterWithTimeoutMock = vi.fn().mockReturnThis();
vi.mock('../src/shared/message-awaiter.ts', () => {
  return {
    MessageAwaiter: vi.fn().mockImplementation((...args) => {
      MessageAwaiterConstructorMock(args);
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
