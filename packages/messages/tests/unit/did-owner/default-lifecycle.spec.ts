import { LifecycleRunner, LifecycleRunnerOptions, RunnerState } from '@hiero-did-sdk/lifecycle';
import { resolveDID } from '@hiero-did-sdk/resolver';
import { DIDError, Network, Signer } from '@hiero-did-sdk/core';
import { PrivateKey, TopicMessageSubmitTransaction } from '@hashgraph/sdk';
import { DIDOwnerMessage, DIDOwnerMessageHederaDefaultLifeCycle } from '../../../src';
import { DIDOwnerMessageContext } from '../../../src/messages/did-owner/lifecycle/context';
import { NETWORK, SIGNATURE, TestVerifier, VALID_DID_TOPIC_ID } from '../helpers';

jest.mock('@hiero-did-sdk/resolver', () => {
  return {
    resolveDID: jest.fn(),
  };
});

const privateKey = PrivateKey.generateED25519();

const mockSigner = new (class extends Signer {
  publicKey = jest.fn().mockResolvedValue(privateKey.publicKey.toStringDer());
  sign = jest.fn().mockImplementation(() => SIGNATURE);
  verify = jest.fn().mockResolvedValue(true);
})();

const mockPublisher = {
  network: () => NETWORK as Network,
  publicKey: () => privateKey.publicKey,
  publish: jest.fn().mockResolvedValue({
    topicId: VALID_DID_TOPIC_ID,
  }),
};

const resolverMock = resolveDID as jest.Mock;

describe('Default DID Owner Lifecycle', () => {
  beforeEach(() => {
    resolverMock.mockRejectedValue(new DIDError('notFound', 'DID not found'));
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('when processing a valid DIDOwnerMessage', () => {
    let message: DIDOwnerMessage;
    let result: RunnerState<DIDOwnerMessage>;

    beforeEach(async () => {
      const verifier = new TestVerifier();
      const privateKey = await PrivateKey.generateED25519Async();
      message = new DIDOwnerMessage({
        publicKey: privateKey.publicKey,
      });

      verifier.verifyMock.mockResolvedValue(true);

      const runner = new LifecycleRunner(DIDOwnerMessageHederaDefaultLifeCycle);
      result = await runner.process(message, {
        signer: mockSigner,
        publisher: mockPublisher,
        context: {
          topicReader: undefined,
        },
        args: {
          verifier,
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
      expect(mockSigner.sign).toHaveBeenCalledTimes(1);
      expect(result.message.signature).toBe(SIGNATURE);
    });

    it('should have a paused state', () => {
      expect(result.status).toBe('pause');
    });

    describe('when resuming the lifecycle', () => {
      beforeEach(async () => {
        const runner = new LifecycleRunner(DIDOwnerMessageHederaDefaultLifeCycle);
        const verifier = new TestVerifier();
        verifier.verifyMock.mockResolvedValue(true);

        result = await runner.resume(result, {
          signer: mockSigner,
          publisher: mockPublisher,
          context: {
            topicReader: undefined,
          },
          args: {
            verifier,
          },
        });
      });

      it('should publish the message to the topic', () => {
        expect(mockPublisher.publish).toHaveBeenCalledWith(expect.any(TopicMessageSubmitTransaction));
      });
    });

    afterEach(() => {
      jest.clearAllMocks();
    });
  });

  it('should throw an error if the topic ID is missing', async () => {
    const message = new DIDOwnerMessage({
      publicKey: privateKey.publicKey,
    });

    const verifier = new TestVerifier();
    verifier.verifyMock.mockResolvedValue(true);

    mockPublisher.publish.mockResolvedValueOnce({
      status: 'failed',
    });

    const runner = new LifecycleRunner(DIDOwnerMessageHederaDefaultLifeCycle);
    await expect(
      runner.process(message, {
        signer: mockSigner,
        publisher: mockPublisher,
        context: {
          topicReader: undefined,
        },
        args: {
          verifier,
        },
      })
    ).rejects.toThrow('Failed to create topic, transaction status: failed');
  });

  it('should throw an error if the DID existing', async () => {
    resolverMock.mockResolvedValue({ id: 'did:testnet' });

    const message = new DIDOwnerMessage({
      publicKey: privateKey.publicKey,
    });

    const verifier = new TestVerifier();
    verifier.verifyMock.mockResolvedValue(true);

    const runner = new LifecycleRunner(DIDOwnerMessageHederaDefaultLifeCycle);
    await expect(
      runner.process(message, {
        signer: mockSigner,
        publisher: mockPublisher,
        context: {
          topicReader: undefined,
        },
        args: {
          verifier,
        },
      })
    ).rejects.toThrow('DID already exists on the network');
  });

  it('should pass the topic reader to the resolver', async () => {
    const topicReader = {
      fetchAllToDate: jest.fn().mockResolvedValue([]),
      fetchFrom: jest.fn().mockResolvedValue([]),
    };
    resolverMock.mockRejectedValue(new DIDError('notFound', 'DID not found'));

    const message = new DIDOwnerMessage({
      publicKey: privateKey.publicKey,
    });

    const verifier = new TestVerifier();
    verifier.verifyMock.mockResolvedValue(true);

    const runner = new LifecycleRunner(DIDOwnerMessageHederaDefaultLifeCycle);
    await runner.process(message, {
      signer: mockSigner,
      publisher: mockPublisher,
      context: {
        topicReader: topicReader,
      },
      args: {
        verifier,
      },
    });

    expect(resolverMock).toHaveBeenCalledWith(message.did, 'application/did+json', {
      topicReader,
    });
  });

  it('should skip the topic creation if the topic ID is already set', async () => {
    const message = new DIDOwnerMessage({
      publicKey: privateKey.publicKey,
      topicId: VALID_DID_TOPIC_ID,
    });

    const verifier = new TestVerifier();
    verifier.verifyMock.mockResolvedValue(true);

    const runner = new LifecycleRunner(DIDOwnerMessageHederaDefaultLifeCycle);
    const runnerOptions: LifecycleRunnerOptions<DIDOwnerMessageContext> = {
      signer: mockSigner,
      publisher: mockPublisher,
      context: {
        topicReader: undefined,
      },
      args: {
        verifier,
      },
    };
    const state = await runner.process(message, runnerOptions);
    await runner.resume(state, runnerOptions);

    expect(mockPublisher.publish).toHaveBeenCalledTimes(1);
  });
});
