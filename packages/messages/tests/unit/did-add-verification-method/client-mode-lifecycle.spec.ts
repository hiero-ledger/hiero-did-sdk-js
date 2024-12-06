import {
  LifecycleRunner,
  RunnerState,
} from '@swiss-digital-assets-institute/lifecycle';
import { Publisher } from '@swiss-digital-assets-institute/core';
import { TopicMessageSubmitTransaction } from '@hashgraph/sdk';
import {
  DIDAddVerificationMethodMessage,
  DIDAddVerificationMethodMessageHederaCSMLifeCycle,
} from '../../../src';
import { PUBLIC_KEY_MULTIBASE, SIGNATURE, VALID_DID } from '../helpers';

describe('Client mode DIDAddVerificationMethodMessage Lifecycle', () => {
  describe('when processing a valid DIDAddVerificationMethodMessage', () => {
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

      result = await runner.resume(pauseStep, {
        publisher,
        args: {
          signature: SIGNATURE,
        },
      });
    });

    it('should publish the message to the topic', () => {
      expect(publishMock).toHaveBeenCalledWith(
        expect.any(TopicMessageSubmitTransaction),
      );
    });

    it('should set the given signature', () => {
      expect(result.message.signature).toBe(SIGNATURE);
    });

    afterEach(() => {
      jest.clearAllMocks();
    });
  });
});
