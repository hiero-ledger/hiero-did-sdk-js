import { LifecycleRunner, RunnerState } from '@hashgraph-did-sdk/lifecycle';
import { Publisher } from '@hashgraph-did-sdk/core';
import { TopicMessageSubmitTransaction } from '@hashgraph/sdk';
import {
  DIDAddServiceMessage,
  DIDAddServiceMessageHederaCSMLifeCycle,
} from '../../../src';
import { SIGNATURE, VALID_DID } from '../helpers';

describe('Client mode DIDAddServiceMessage Lifecycle', () => {
  describe('when processing a valid DIDAddServiceMessage', () => {
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
