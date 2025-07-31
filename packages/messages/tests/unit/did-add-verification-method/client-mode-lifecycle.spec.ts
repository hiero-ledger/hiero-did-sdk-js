import {
  LifecycleRunner,
  RunnerState,
} from '@hiero-did-sdk/lifecycle';
import { Publisher } from '@hiero-did-sdk/core';
import { TopicMessageSubmitTransaction } from '@hashgraph/sdk';
import {
  DIDAddVerificationMethodMessage,
  DIDAddVerificationMethodMessageHederaCSMLifeCycle,
} from '../../../src';
import {
  PUBLIC_KEY_MULTIBASE,
  SIGNATURE,
  TestVerifier,
  VALID_DID,
} from '../helpers';

describe('Client mode DIDAddVerificationMethodMessage Lifecycle', () => {
  describe('when processing a valid DIDAddVerificationMethodMessage', () => {
    const verifier = new TestVerifier();
    let publishMock: jest.Mock;
    let message: DIDAddVerificationMethodMessage;
    let result: RunnerState<DIDAddVerificationMethodMessage>;

    beforeEach(async () => {
      message = new DIDAddVerificationMethodMessage({
        publicKeyMultibase: PUBLIC_KEY_MULTIBASE,
        controller: VALID_DID,
        property: 'verificationMethod',
        id: '#key-1',
        did: VALID_DID,
      });

      publishMock = jest.fn();

      const publisher: Publisher = {
        network: jest.fn(),
        publicKey: jest.fn(),
        publish: publishMock,
      };

      const runner = new LifecycleRunner(
        DIDAddVerificationMethodMessageHederaCSMLifeCycle,
      );
      const pauseStep = await runner.process(message, {
        publisher: {
          network: jest.fn(),
          publicKey: jest.fn(),
          publish: publishMock,
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
      });
    });

    describe('when resuming the lifecycle', () => {
      beforeEach(async () => {
        const runner = new LifecycleRunner(
          DIDAddVerificationMethodMessageHederaCSMLifeCycle,
        );
        result = await runner.resume(result, {
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

    it('should set the given signature', () => {
      expect(result.message.signature).toBe(SIGNATURE);
    });

    afterEach(() => {
      jest.clearAllMocks();
    });
  });
});
