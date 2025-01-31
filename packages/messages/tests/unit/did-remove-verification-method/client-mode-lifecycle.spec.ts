import {
  LifecycleRunner,
  RunnerState,
} from '@swiss-digital-assets-institute/lifecycle';
import { Publisher } from '@swiss-digital-assets-institute/core';
import { TopicMessageSubmitTransaction } from '@hashgraph/sdk';
import {
  DIDRemoveVerificationMethodMessage,
  DIDRemoveVerificationMethodMessageHederaCSMLifeCycle,
} from '../../../src';
import { SIGNATURE, TestVerifier, VALID_DID } from '../helpers';

describe('Client mode DIDRemoveVerificationMethodMessage Lifecycle', () => {
  describe('when processing a valid DIDRemoveVerificationMethodMessage', () => {
    const verifier = new TestVerifier();
    let publishMock: jest.Mock;
    let message: DIDRemoveVerificationMethodMessage;
    let result: RunnerState<DIDRemoveVerificationMethodMessage>;

    beforeEach(async () => {
      message = new DIDRemoveVerificationMethodMessage({
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
        DIDRemoveVerificationMethodMessageHederaCSMLifeCycle,
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
          DIDRemoveVerificationMethodMessageHederaCSMLifeCycle,
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
