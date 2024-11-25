import { LifecycleRunner, RunnerState } from '@hashgraph-did-sdk/lifecycle';
import { Publisher } from '@hashgraph-did-sdk/core';
import { TopicMessageSubmitTransaction } from '@hashgraph/sdk';
import {
  DIDRemoveServiceMessage,
  DIDRemoveServiceMessageHederaCSMLifeCycle,
} from '../../../src';
import { SIGNATURE, VALID_DID } from '../helpers';

describe('Client mode DIDRemoveServiceMessage Lifecycle', () => {
  describe('when processing a valid DIDRemoveServiceMessage', () => {
    let publishMock: jest.Mock;
    let message: DIDRemoveServiceMessage;
    let result: RunnerState<DIDRemoveServiceMessage>;

    beforeEach(async () => {
      message = new DIDRemoveServiceMessage({
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
        DIDRemoveServiceMessageHederaCSMLifeCycle,
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
