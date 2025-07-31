import {
  LifecycleRunner,
  RunnerState,
} from '@hiero-did-sdk/lifecycle';
import { Publisher } from '@hiero-did-sdk/core';
import { TopicMessageSubmitTransaction } from '@hashgraph/sdk';
import {
  DIDAddServiceMessage,
  DIDAddServiceMessageHederaCSMLifeCycle,
} from '../../../src';
import { SIGNATURE, TestVerifier, VALID_DID } from '../helpers';

describe('Client mode DIDAddServiceMessage Lifecycle', () => {
  describe('when processing a valid DIDAddServiceMessage', () => {
    const verifier = new TestVerifier();
    let publishMock: jest.Mock;
    let message: DIDAddServiceMessage;
    let result: RunnerState<DIDAddServiceMessage>;

    beforeEach(async () => {
      message = new DIDAddServiceMessage({
        type: 'VerifiableCredentialService',
        serviceEndpoint: 'https://example.com/credentials',
        id: '#service-1',
        did: VALID_DID,
      });

      publishMock = jest.fn();

      const publisher: Publisher = {
        network: jest.fn(),
        publicKey: jest.fn(),
        publish: publishMock,
      };

      const runner = new LifecycleRunner(
        DIDAddServiceMessageHederaCSMLifeCycle,
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
          DIDAddServiceMessageHederaCSMLifeCycle,
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
