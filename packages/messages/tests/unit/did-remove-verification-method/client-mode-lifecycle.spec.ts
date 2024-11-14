import { LifecycleRunner, RunnerState } from '@hashgraph-did-sdk/lifecycle';
import { Publisher } from '@hashgraph-did-sdk/core';
import { TopicMessageSubmitTransaction } from '@hashgraph/sdk';
import {
  DIDRemoveVerificationMethodMessage,
  DIDRemoveVerificationMethodMessageHederaCSMLifeCycle,
} from '../../../src';
import { SIGNATURE, VALID_DID } from '../helpers';

describe('Client mode DIDRemoveVerificationMethodMessage Lifecycle', () => {
  describe('when processing a valid DIDRemoveVerificationMethodMessage', () => {
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
