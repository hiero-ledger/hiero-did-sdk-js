import { LifecycleRunner, RunnerState } from '@hiero-did-sdk/lifecycle';
import { TopicMessageSubmitTransaction } from '@hashgraph/sdk';
import { DIDAddServiceMessage, DIDAddServiceMessageHederaDefaultLifeCycle } from '../../../src';
import { SIGNATURE, TestVerifier, VALID_DID, VALID_DID_TOPIC_ID } from '../helpers';
import { Signer } from '@hiero-did-sdk/core';

const mockSigner = {
  publicKey: vi.fn(),
  sign: vi.fn(),
  verify: vi.fn(),
} as unknown as Signer;

const mockPublisher = {
  network: vi.fn(),
  publicKey: vi.fn(),
  publish: vi.fn(),
};

describe('Default DIDAddServiceMessage Lifecycle', () => {

  beforeEach(() => {
    mockSigner.sign = vi.fn().mockReturnValue(SIGNATURE);
    mockSigner.verify = vi.fn().mockReturnValue(true);
    mockPublisher.publish = vi.fn().mockResolvedValue({
      topicId: VALID_DID_TOPIC_ID,
    });
  })
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
      vi.clearAllMocks();
    });
  });
});
