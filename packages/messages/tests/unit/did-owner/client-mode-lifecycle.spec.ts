import { LifecycleRunner, RunnerState } from '@swiss-digital-assets-institute/lifecycle';
import { Publisher } from '@swiss-digital-assets-institute/core';
import { PrivateKey, TopicMessageSubmitTransaction } from '@hashgraph/sdk';
import {
  DIDOwnerMessage,
  DIDOwnerMessageHederaCSMLifeCycle,
} from '../../../src';
import { NETWORK, SIGNATURE, VALID_DID_TOPIC_ID } from '../helpers';

describe('Client Mode DID Owner Lifecycle', () => {
  describe('when processing a valid DIDOwnerMessage', () => {
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
      });

      expect(pauseStep.status).toBe('pause');

      result = await runner.resume(pauseStep, {
        publisher,
        args: {
          signature: SIGNATURE,
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

    it('should publish the message to the topic', () => {
      expect(publishMock).toHaveBeenCalledWith(
        expect.any(TopicMessageSubmitTransaction),
      );
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
        signer: {
          publicKey: () => privateKey.publicKey.toStringDer(),
          sign: jest.fn(),
          verify: jest.fn(),
        },
        publisher: {
          network: () => NETWORK,
          publicKey: () => privateKey.publicKey,
          publish: jest.fn().mockResolvedValue({}),
        },
      }),
    ).rejects.toThrow('Topic ID is missing');
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
    });

    expect(state.status).toBe('pause');
    expect(publishMock).toHaveBeenCalledTimes(0);
  });
});
