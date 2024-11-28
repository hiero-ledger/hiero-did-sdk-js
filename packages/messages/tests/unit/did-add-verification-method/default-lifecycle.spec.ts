import { LifecycleRunner, RunnerState } from '@swiss-digital-assets-institute/lifecycle';
import { TopicMessageSubmitTransaction } from '@hashgraph/sdk';
import {
  DIDAddVerificationMethodMessage,
  DIDAddVerificationMethodMessageHederaDefaultLifeCycle,
} from '../../../src';
import { SIGNATURE, VALID_DID, VALID_DID_TOPIC_ID } from '../helpers';

describe('Default DIDAddVerificationMethodMessage Lifecycle', () => {
  describe('when processing a valid DIDAddVerificationMethodMessage', () => {
    let publishMock: jest.Mock;
    let signMock: jest.Mock;
    let message: DIDAddVerificationMethodMessage;
    let result: RunnerState<DIDAddVerificationMethodMessage>;

    beforeEach(async () => {
      message = new DIDAddVerificationMethodMessage({
        publicKeyMultibase: 'z6LSk4Qv3Q',
        controller: VALID_DID,
        property: 'verificationMethod',
        id: '#key-1',
        did: VALID_DID,
      });

      publishMock = jest.fn().mockResolvedValue({
        topicId: VALID_DID_TOPIC_ID,
      });

      signMock = jest.fn().mockImplementation(() => {
        return SIGNATURE;
      });

      const runner = new LifecycleRunner(
        DIDAddVerificationMethodMessageHederaDefaultLifeCycle,
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
      });
    });

    it('should sign with given signer', () => {
      expect(signMock).toHaveBeenCalledTimes(1);
      expect(result.message.signature).toBe(SIGNATURE);
    });

    it('should publish the message to the topic', () => {
      expect(publishMock).toHaveBeenCalledWith(
        expect.any(TopicMessageSubmitTransaction),
      );
    });

    afterEach(() => {
      jest.clearAllMocks();
    });
  });
});
