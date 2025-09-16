import { LifecycleRunner, RunnerState } from '@hiero-did-sdk/lifecycle';
import { TopicMessageSubmitTransaction } from '@hashgraph/sdk';
import { DIDAddServiceMessage, DIDAddServiceMessageHederaDefaultLifeCycle } from '../../../src';
import { SIGNATURE, TestVerifier, VALID_DID, VALID_DID_TOPIC_ID } from '../helpers';
import { Signer } from '@hiero-did-sdk/core';

const mockSigner = new (class extends Signer {
  publicKey = jest.fn();
  sign = jest.fn().mockImplementation(() => SIGNATURE);
  verify = jest.fn().mockResolvedValue(true);
})();

const mockPublisher = {
  network: jest.fn(),
  publicKey: jest.fn(),
  publish: jest.fn().mockResolvedValue({
    topicId: VALID_DID_TOPIC_ID,
  }),
};

describe('Default DIDAddServiceMessage Lifecycle', () => {
  describe('when processing a valid DIDAddServiceMessage', () => {
    let message: DIDAddServiceMessage;
    let result: RunnerState<DIDAddServiceMessage>;

    beforeEach(async () => {
      const verifier = new TestVerifier();
      message = new DIDAddServiceMessage({
        type: 'VerifiableCredentialService',
        serviceEndpoint: 'https://example.com/credentials',
        id: '#service-1',
        did: VALID_DID,
      });

      verifier.verifyMock.mockResolvedValue(true);

      const runner = new LifecycleRunner(DIDAddServiceMessageHederaDefaultLifeCycle);
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
        const runner = new LifecycleRunner(DIDAddServiceMessageHederaDefaultLifeCycle);
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
      jest.clearAllMocks();
    });
  });
});
