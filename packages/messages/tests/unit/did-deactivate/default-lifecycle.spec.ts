import { LifecycleRunner, RunnerState } from '@hashgraph-did-sdk/lifecycle';
import { TopicMessageSubmitTransaction } from '@hashgraph/sdk';
import {
  DIDDeactivateMessage,
  DIDDeactivateMessageHederaDefaultLifeCycle,
} from '../../../src';
import { SIGNATURE, VALID_DID, VALID_DID_TOPIC_ID } from '../helpers';

describe('Default DIDDeactivateMessage Lifecycle', () => {
  describe('when processing a valid DIDDeactivateMessage', () => {
    let publishMock: jest.Mock;
    let signMock: jest.Mock;
    let message: DIDDeactivateMessage;
    let result: RunnerState<DIDDeactivateMessage>;

    beforeEach(async () => {
      message = new DIDDeactivateMessage({
        did: VALID_DID,
      });

      publishMock = jest.fn().mockResolvedValue({
        topicId: VALID_DID_TOPIC_ID,
      });

      signMock = jest.fn().mockImplementation(() => {
        return SIGNATURE;
      });

      const runner = new LifecycleRunner(
        DIDDeactivateMessageHederaDefaultLifeCycle,
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
