import {
  LifecycleRunner,
  RunnerState,
} from '@hiero-did-sdk/lifecycle';
import { TopicMessageSubmitTransaction } from '@hashgraph/sdk';
import {
  DIDRemoveVerificationMethodMessage,
  DIDRemoveVerificationMethodMessageHederaDefaultLifeCycle,
} from '../../../src';
import {
  SIGNATURE,
  TestVerifier,
  VALID_DID,
  VALID_DID_TOPIC_ID,
} from '../helpers';

describe('Default DIDRemoveVerificationMethodMessage Lifecycle', () => {
  describe('when processing a valid DIDRemoveVerificationMethodMessage', () => {
    let publishMock: jest.Mock;
    let signMock: jest.Mock;
    let message: DIDRemoveVerificationMethodMessage;
    let result: RunnerState<DIDRemoveVerificationMethodMessage>;

    beforeEach(async () => {
      const verifier = new TestVerifier();
      message = new DIDRemoveVerificationMethodMessage({
        property: 'verificationMethod',
        id: '#key-1',
        did: VALID_DID,
      });

      verifier.verifyMock.mockResolvedValue(true);

      publishMock = jest.fn().mockResolvedValue({
        topicId: VALID_DID_TOPIC_ID,
      });

      signMock = jest.fn().mockImplementation(() => {
        return SIGNATURE;
      });

      const runner = new LifecycleRunner(
        DIDRemoveVerificationMethodMessageHederaDefaultLifeCycle,
      );
      result = await runner.process(message, {
        signer: {
          publicKey: jest.fn(),
          sign: signMock,
          verify: jest.fn(),
        },
        publisher: {
          network: jest.fn(),
          publicKey: jest.fn(),
          publish: publishMock,
        },
        args: {
          verifier,
        },
      });
    });

    it('should sign with given signer', () => {
      expect(signMock).toHaveBeenCalledTimes(1);
      expect(result.message.signature).toBe(SIGNATURE);
    });

    it('should have a paused state', () => {
      expect(result.status).toBe('pause');
    });

    describe('when resuming the lifecycle', () => {
      beforeEach(async () => {
        const runner = new LifecycleRunner(
          DIDRemoveVerificationMethodMessageHederaDefaultLifeCycle,
        );
        result = await runner.resume(result, {
          signer: {
            publicKey: jest.fn(),
            sign: signMock,
            verify: jest.fn(),
          },
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

    afterEach(() => {
      jest.clearAllMocks();
    });
  });
});
