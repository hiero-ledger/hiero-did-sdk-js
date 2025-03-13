import {
  LifecycleRunner,
  RunnerState,
} from '@swiss-digital-assets-institute/lifecycle';
import { Publisher, DIDError } from '@swiss-digital-assets-institute/core';
import { resolveDID } from '@swiss-digital-assets-institute/resolver';
import { PrivateKey, TopicMessageSubmitTransaction } from '@hashgraph/sdk';
import {
  DIDOwnerMessage,
  DIDOwnerMessageHederaCSMLifeCycle,
} from '../../../src';
import {
  NETWORK,
  SIGNATURE,
  TestVerifier,
  VALID_DID_TOPIC_ID,
} from '../helpers';

jest.mock('@swiss-digital-assets-institute/resolver', () => {
  return {
    resolveDID: jest.fn(),
  };
});

const resolverMock = resolveDID as jest.Mock;

describe('Client Mode DID Owner Lifecycle', () => {
  beforeEach(() => {
    resolverMock.mockRejectedValue(new DIDError('notFound', 'DID not found'));
  });

  describe('when processing a valid DIDOwnerMessage', () => {
    const verifier = new TestVerifier();
    let publishMock: jest.Mock;
    let message: DIDOwnerMessage;
    let result: RunnerState<DIDOwnerMessage>;

    beforeEach(async () => {
      const privateKey = await PrivateKey.generateED25519Async();
      message = new DIDOwnerMessage({
        publicKey: privateKey.publicKey,
      });

      publishMock = jest.fn().mockResolvedValue({
        topicId: VALID_DID_TOPIC_ID,
      });

      const publisher: Publisher = {
        network: () => NETWORK,
        publicKey: () => privateKey.publicKey,
        publish: publishMock,
      };

      const runner = new LifecycleRunner(DIDOwnerMessageHederaCSMLifeCycle);
      const pauseStep = await runner.process(message, {
        publisher,
        context: {
          topicReader: undefined,
        },
      });

      expect(pauseStep.status).toBe('pause');

      verifier.verifyMock.mockReturnValue(true);

      result = await runner.resume(pauseStep, {
        publisher,
        args: {
          signature: SIGNATURE,
          verifier,
        },
        context: {
          topicReader: undefined,
        },
      });
    });

    it('should set the network of the publisher', () => {
      expect(result.message.network).toBe(NETWORK);
    });

    it('should set the topic ID of the message', () => {
      expect(result.message.topicId).toBe(VALID_DID_TOPIC_ID);
    });

    it('should set the given signature', () => {
      expect(result.message.signature).toBe(SIGNATURE);
    });

    describe('when resuming the lifecycle', () => {
      beforeEach(async () => {
        const runner = new LifecycleRunner(DIDOwnerMessageHederaCSMLifeCycle);
        result = await runner.resume(result, {
          publisher: {
            network: jest.fn(),
            publicKey: jest.fn(),
            publish: publishMock,
          },
          context: {
            topicReader: undefined,
          },
        });
      });

      it('should publish the message to the topic', () => {
        expect(publishMock).toHaveBeenCalledWith(
          expect.any(TopicMessageSubmitTransaction),
        );
      });
    });

    afterEach(() => {
      jest.clearAllMocks();
    });
  });

  it('should throw an error if the topic ID is missing', async () => {
    const privateKey = await PrivateKey.generateED25519Async();
    const message = new DIDOwnerMessage({
      publicKey: privateKey.publicKey,
    });

    const runner = new LifecycleRunner(DIDOwnerMessageHederaCSMLifeCycle);
    await expect(
      runner.process(message, {
        publisher: {
          network: () => NETWORK,
          publicKey: () => privateKey.publicKey,
          publish: jest.fn().mockResolvedValue({
            status: 'failed',
          }),
        },
        context: {
          topicReader: undefined,
        },
      }),
    ).rejects.toThrow('Failed to create topic, transaction status: failed');
  });

  it('should throw an error if the DID existing', async () => {
    resolverMock.mockResolvedValue({ id: 'did:testnet' });

    const privateKey = await PrivateKey.generateED25519Async();
    const message = new DIDOwnerMessage({
      publicKey: privateKey.publicKey,
    });

    const publishMock = jest.fn().mockResolvedValue({
      topicId: VALID_DID_TOPIC_ID,
    });
    const runner = new LifecycleRunner(DIDOwnerMessageHederaCSMLifeCycle);
    await expect(
      runner.process(message, {
        publisher: {
          network: () => NETWORK,
          publicKey: () => privateKey.publicKey,
          publish: publishMock,
        },
        context: {
          topicReader: undefined,
        },
      }),
    ).rejects.toThrow('DID already exists on the network');
  });

  it('should pass the topic reader to the resolver', async () => {
    const topicReader = {
      fetchAllToDate: jest.fn().mockResolvedValue([]),
      fetchFrom: jest.fn().mockResolvedValue([]),
    };
    resolverMock.mockRejectedValue(new DIDError('notFound', 'DID not found'));

    const privateKey = await PrivateKey.generateED25519Async();
    const message = new DIDOwnerMessage({
      publicKey: privateKey.publicKey,
    });

    const publishMock = jest.fn().mockResolvedValue({
      topicId: VALID_DID_TOPIC_ID,
    });
    const runner = new LifecycleRunner(DIDOwnerMessageHederaCSMLifeCycle);
    await runner.process(message, {
      publisher: {
        network: () => NETWORK,
        publicKey: () => privateKey.publicKey,
        publish: publishMock,
      },
      context: {
        topicReader: topicReader,
      },
    });

    expect(resolverMock).toHaveBeenCalledWith(
      message.did,
      'application/did+json',
      {
        topicReader,
      },
    );
  });

  it('should skip the topic creation if the topic ID is already set', async () => {
    const privateKey = await PrivateKey.generateED25519Async();
    const message = new DIDOwnerMessage({
      publicKey: privateKey.publicKey,
      topicId: VALID_DID_TOPIC_ID,
    });

    const publishMock = jest.fn();

    const runner = new LifecycleRunner(DIDOwnerMessageHederaCSMLifeCycle);
    const state = await runner.process(message, {
      publisher: {
        network: () => NETWORK,
        publicKey: () => privateKey.publicKey,
        publish: publishMock,
      },
      context: {
        topicReader: undefined,
      },
    });

    expect(state.status).toBe('pause');
    expect(publishMock).toHaveBeenCalledTimes(0);
  });
});
