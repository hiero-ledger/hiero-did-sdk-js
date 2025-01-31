import {
  LifecycleRunner,
  LifecycleRunnerOptions,
  RunnerState,
} from '@swiss-digital-assets-institute/lifecycle';
import { resolveDID } from '@swiss-digital-assets-institute/resolver';
import { DIDError } from '@swiss-digital-assets-institute/core';
import { PrivateKey, TopicMessageSubmitTransaction } from '@hashgraph/sdk';
import {
  DIDOwnerMessage,
  DIDOwnerMessageHederaDefaultLifeCycle,
} from '../../../src';
import { NETWORK, SIGNATURE, VALID_DID_TOPIC_ID } from '../helpers';

jest.mock('@swiss-digital-assets-institute/resolver', () => {
  return {
    resolveDID: jest.fn(),
  };
});

const resolverMock = resolveDID as jest.Mock;

describe('Default DID Owner Lifecycle', () => {
  beforeEach(() => {
    resolverMock.mockRejectedValue(new DIDError('notFound', 'DID not found'));
  });

  describe('when processing a valid DIDOwnerMessage', () => {
    let publishMock: jest.Mock;
    let signMock: jest.Mock;
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

      signMock = jest.fn().mockImplementation(() => {
        return SIGNATURE;
      });

      const runner = new LifecycleRunner(DIDOwnerMessageHederaDefaultLifeCycle);
      result = await runner.process(message, {
        signer: {
          publicKey: () => privateKey.publicKey.toStringDer(),
          sign: signMock,
          verify: jest.fn(),
        },
        publisher: {
          network: () => NETWORK,
          publicKey: () => privateKey.publicKey,
          publish: publishMock,
        },
      });
    });

    it('should set the network of the publisher', () => {
      expect(result.message.network).toBe(NETWORK);
    });

    it('should set the topic ID of the message', () => {
      expect(result.message.topicId).toBe(VALID_DID_TOPIC_ID);
    });

    it('should sign with given signer', () => {
      expect(signMock).toHaveBeenCalledTimes(1);
      expect(result.message.signature).toBe(SIGNATURE);
    });

    it('should have a paused state', () => {
      expect(result.status).toBe('pause');
    });

    describe('when resuming the lifecycle', () => {
      beforeEach(async () => {
        const runner = new LifecycleRunner(
          DIDOwnerMessageHederaDefaultLifeCycle,
        );
        result = await runner.resume(result, {
          signer: {
            publicKey: jest.fn(),
            sign: signMock,
            verify: jest.fn(),
          },
          publisher: {
            network: jest.fn(),
            publicKey: jest.fn(),
            publish: publishMock,
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

    const runner = new LifecycleRunner(DIDOwnerMessageHederaDefaultLifeCycle);
    await expect(
      runner.process(message, {
        signer: {
          publicKey: () => privateKey.publicKey.toStringDer(),
          sign: jest.fn(),
          verify: jest.fn(),
        },
        publisher: {
          network: () => NETWORK,
          publicKey: () => privateKey.publicKey,
          publish: jest.fn().mockResolvedValue({
            status: 'failed',
          }),
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
    const runner = new LifecycleRunner(DIDOwnerMessageHederaDefaultLifeCycle);
    await expect(
      runner.process(message, {
        signer: {
          publicKey: () => privateKey.publicKey.toStringDer(),
          sign: jest.fn(),
          verify: jest.fn(),
        },
        publisher: {
          network: () => NETWORK,
          publicKey: () => privateKey.publicKey,
          publish: publishMock,
        },
      }),
    ).rejects.toThrow('DID already exists on the network');
  });

  it('should skip the topic creation if the topic ID is already set', async () => {
    const privateKey = await PrivateKey.generateED25519Async();
    const message = new DIDOwnerMessage({
      publicKey: privateKey.publicKey,
      topicId: VALID_DID_TOPIC_ID,
    });

    const publishMock = jest.fn();

    const runner = new LifecycleRunner(DIDOwnerMessageHederaDefaultLifeCycle);
    const runnerOptions: LifecycleRunnerOptions = {
      signer: {
        publicKey: () => privateKey.publicKey.toStringDer(),
        sign: jest.fn().mockResolvedValue(SIGNATURE),
        verify: jest.fn(),
      },
      publisher: {
        network: () => NETWORK,
        publicKey: () => privateKey.publicKey,
        publish: publishMock,
      },
    };
    const state = await runner.process(message, runnerOptions);
    await runner.resume(state, runnerOptions);

    expect(publishMock).toHaveBeenCalledTimes(1);
  });
});
