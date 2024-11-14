import { LifecycleRunner, RunnerState } from '@hashgraph-did-sdk/lifecycle';
import { Publisher } from '@hashgraph-did-sdk/core';
import { TopicMessageSubmitTransaction } from '@hashgraph/sdk';
import {
  DIDDeactivateMessage,
  DIDDeactivateMessageHederaCSMLifeCycle,
} from '../../../src';
import { SIGNATURE, VALID_DID } from '../helpers';

describe('Client mode DIDDeactivateMessage Lifecycle', () => {
  describe('when processing a valid DIDDeactivateMessage', () => {
    let publishMock: jest.Mock;
    let message: DIDDeactivateMessage;
    let result: RunnerState<DIDDeactivateMessage>;

    beforeEach(async () => {
      message = new DIDDeactivateMessage({
        did: VALID_DID,
      });

      publishMock = jest.fn();

      const publisher: Publisher = {
        network: jest.fn(),
        publicKey: jest.fn(),
        publish: publishMock,
      };

      const runner = new LifecycleRunner(
        DIDDeactivateMessageHederaCSMLifeCycle,
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
