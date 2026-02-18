import { LifecycleRunner, RunnerState } from '@hiero-did-sdk/lifecycle';
import { TopicMessageSubmitTransaction } from '@hashgraph/sdk';
import {
  DIDRemoveVerificationMethodMessage,
  DIDRemoveVerificationMethodMessageHederaDefaultLifeCycle,
} from '../../../src';
import { SIGNATURE, TestVerifier, VALID_DID, VALID_DID_TOPIC_ID } from '../helpers';
import { Signer } from '@hiero-did-sdk/core';


describe('Default DIDRemoveVerificationMethodMessage Lifecycle', () => {
  let mockSigner;
  let mockPublisher;

  beforeEach(() => {
    mockSigner = new (class extends Signer {
      publicKey = vi.fn();
      sign = vi.fn().mockImplementation(() => SIGNATURE);
      verify = vi.fn().mockResolvedValue(true);
    })();

    mockPublisher = {
      network: vi.fn(),
      publicKey: vi.fn(),
      publish: vi.fn().mockResolvedValue({
        topicId: VALID_DID_TOPIC_ID,
      }),
    };
  })

  describe('when processing a valid DIDRemoveVerificationMethodMessage', () => {
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

      const runner = new LifecycleRunner(DIDRemoveVerificationMethodMessageHederaDefaultLifeCycle);
      result = await runner.process(message, {
        signer: mockSigner,
        publisher: mockPublisher,
        args: {
          verifier,
        },
      });
    });

    it('should sign with given signer', () => {
      expect(mockSigner.sign).toHaveBeenCalledTimes(1);
      expect(result.message.signature).toBe(SIGNATURE);
    });

    it('should have a paused state', () => {
      expect(result.status).toBe('pause');
    });

    describe('when resuming the lifecycle', () => {
      beforeEach(async () => {
        const runner = new LifecycleRunner(DIDRemoveVerificationMethodMessageHederaDefaultLifeCycle);
        result = await runner.resume(result, {
          signer: mockSigner,
          publisher: mockPublisher,
        });
      });

      it('should publish the message to the topic', () => {
        expect(mockPublisher.publish).toHaveBeenCalledWith(expect.any(TopicMessageSubmitTransaction));
      });
    });

    afterEach(() => {
      vi.clearAllMocks();
    });
  });
});
