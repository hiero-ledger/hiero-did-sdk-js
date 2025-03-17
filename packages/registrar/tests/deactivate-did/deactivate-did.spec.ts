/* eslint-disable @typescript-eslint/no-unsafe-member-access */
import {
  TopicMessageSubmitTransactionMock,
  MessageAwaiterForMessagesMock,
  MessageAwaiterConstructorMock,
  MessageAwaiterWaitMock,
  MessageAwaiterWithTimeoutMock,
} from '../mocks';

import { Client, PrivateKey } from '@hashgraph/sdk';
import {
  KeysUtility,
  DID_ROOT_KEY_ID,
} from '@swiss-digital-assets-institute/core';
import { deactivateDID, DeactivateDIDResult } from '../../src';
import {
  VALID_DID_TOPIC_ID,
  TestPublisher,
  TestSigner,
  VALID_DID,
} from '../helpers';

const didDocumentMock = jest.fn();
jest.mock('@swiss-digital-assets-institute/resolver', () => {
  return {
    resolveDID: jest.fn().mockImplementation((...args) =>
      // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
      Promise.resolve(didDocumentMock(...args)),
    ),
  };
});

describe('Deactivate DID operation', () => {
  const TopicMessageSubmitTransactionMockImplementation = {
    setTopicId: jest.fn().mockReturnThis(),
    setMessage: jest.fn().mockReturnThis(),
    execute: jest.fn().mockResolvedValue({
      getReceipt: jest.fn(),
    }),
  };

  TopicMessageSubmitTransactionMock.mockImplementation(
    () => TopicMessageSubmitTransactionMockImplementation,
  );

  let privateKey: PrivateKey;
  beforeEach(async () => {
    privateKey = await PrivateKey.generateED25519Async();
    jest.clearAllMocks();
    didDocumentMock.mockResolvedValue({
      id: VALID_DID,
      controller: VALID_DID,
      verificationMethod: [
        {
          id: DID_ROOT_KEY_ID,
          publicKeyMultibase: KeysUtility.fromPublicKey(
            privateKey.publicKey,
          ).toMultibase(),
        },
      ],
    });
  });

  describe('operations', () => {
    let result: DeactivateDIDResult;
    const defaultSigner = new TestSigner(
      jest.fn().mockImplementation((data) => {
        return privateKey.sign(data as never);
      }),
    );

    it('should deactivate a DID using provided client options', async () => {
      const clientPrivateKey = await PrivateKey.generateED25519Async();

      result = await deactivateDID(
        { did: VALID_DID },
        {
          signer: defaultSigner,
          clientOptions: {
            network: 'testnet',
            privateKey: clientPrivateKey,
            accountId: '0.0.12345',
          },
        },
      );
    });

    it('should deactivate a DID using provided client', async () => {
      const clientPrivateKey = await PrivateKey.generateED25519Async();
      const client = Client.forName('testnet').setOperator(
        '0.0.12345',
        clientPrivateKey,
      );
      result = await deactivateDID(
        { did: VALID_DID },
        {
          signer: defaultSigner,
          client,
        },
      );
    });

    it('should deactivate a DID using provided publisher', async () => {
      const publisher = new TestPublisher();

      result = await deactivateDID(
        { did: VALID_DID },
        {
          signer: defaultSigner,
          publisher,
        },
      );

      expect(publisher.publishMock).toHaveBeenCalledTimes(1);
    });

    it('should deactivate a DID using provided signer', async () => {
      const publisher = new TestPublisher();

      const signer = new TestSigner();
      signer.signMock.mockImplementation((data) => {
        return privateKey.sign(data as never);
      });

      result = await deactivateDID(
        { did: VALID_DID },
        {
          signer,
          publisher,
        },
      );

      expect(signer.signMock).toHaveBeenCalledTimes(1);
    });

    it('should create a new DID using provided private key', async () => {
      const publisher = new TestPublisher();

      const signSpy = jest.spyOn(privateKey, 'sign');

      result = await deactivateDID(
        {
          did: VALID_DID,
          privateKey,
        },
        {
          publisher,
        },
      );

      expect(signSpy).toHaveBeenCalledTimes(1);
    });

    it('should set message awaiter with proper topic id and network', async () => {
      const publisher = new TestPublisher(jest.fn().mockReturnValue('testnet'));

      result = await deactivateDID(
        { did: VALID_DID },
        {
          signer: defaultSigner,
          publisher,
        },
      );

      expect(MessageAwaiterConstructorMock).toHaveBeenCalledWith([
        VALID_DID_TOPIC_ID,
        'testnet',
      ]);
    });

    it('should set message awaiter for a created message', async () => {
      const publisher = new TestPublisher();

      result = await deactivateDID(
        { did: VALID_DID },
        {
          signer: defaultSigner,
          publisher,
        },
      );

      const message =
        TopicMessageSubmitTransactionMockImplementation.setMessage.mock
          .calls[0][0];

      expect(MessageAwaiterForMessagesMock).toHaveBeenCalledWith([message]);
    });

    it('should not call wait method when messageAwaiting is set to false', async () => {
      const publisher = new TestPublisher();

      await deactivateDID(
        {
          did: VALID_DID,
          waitForDIDVisibility: false,
        },
        {
          signer: defaultSigner,
          publisher,
        },
      );

      expect(MessageAwaiterWaitMock).not.toHaveBeenCalled();
    });

    it('should set a message awaiter different timeout', async () => {
      const publisher = new TestPublisher();

      await deactivateDID(
        {
          did: VALID_DID,
          visibilityTimeoutMs: 1,
        },
        {
          signer: defaultSigner,
          publisher,
        },
      );

      expect(MessageAwaiterWithTimeoutMock).toHaveBeenCalledWith(1);
    });

    afterEach(() => {
      expect(result).toMatchObject({
        did: VALID_DID,
      });
      expect(result.didDocument).toMatchObject({
        id: result.did,
        controller: expect.any(String),
        verificationMethod: [],
      });

      expect(
        TopicMessageSubmitTransactionMockImplementation.setTopicId,
      ).toHaveBeenCalledWith(VALID_DID_TOPIC_ID);
      expect(
        TopicMessageSubmitTransactionMockImplementation.setMessage,
      ).toHaveBeenCalledWith(expect.any(String));
    });
  });

  it('should throw an error if the wrong signer is provided', async () => {
    const wrongSigner = new TestSigner();
    const publisher = new TestPublisher();
    const privateKey = await PrivateKey.generateED25519Async();
    wrongSigner.signMock.mockResolvedValue(
      privateKey.sign(new Uint8Array([1, 2, 3, 4])),
    );
    await expect(
      deactivateDID(
        {
          did: VALID_DID,
        },
        { signer: wrongSigner, publisher },
      ),
    ).rejects.toThrow(
      'The signature is invalid. Provided signer does not match the DID signer.',
    );
  });
});
