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
} from '@hiero-did-sdk/core';
import {
  generateDeactivateDIDRequest,
  submitDeactivateDIDRequest,
  DeactivateDIDResult,
} from '../../src';
import { VALID_DID_TOPIC_ID, TestPublisher, VALID_DID } from '../helpers';

const didDocumentMock = jest.fn();
jest.mock('@hiero-did-sdk/resolver', () => {
  return {
    resolveDID: jest
      .fn()
      .mockImplementation(() => Promise.resolve(didDocumentMock())),
  };
});

describe('Deactivate DID operation', () => {
  const TopicMessageSubmitTransactionMockImplementation = {
    setTopicId: jest.fn().mockReturnThis(),
    setMessage: jest.fn().mockReturnThis(),
    freezeWith: jest.fn().mockReturnThis(),
    execute: jest.fn().mockResolvedValue({
      getReceipt: jest.fn(),
    }),
  };

  TopicMessageSubmitTransactionMock.mockImplementation(
    () => TopicMessageSubmitTransactionMockImplementation,
  );

  let didPrivateKey: PrivateKey;

  beforeEach(async () => {
    jest.clearAllMocks();

    didPrivateKey = await PrivateKey.generateED25519Async();

    didDocumentMock.mockReturnValue({
      id: VALID_DID,
      verificationMethod: [
        {
          id: DID_ROOT_KEY_ID,
          type: 'Ed25519VerificationKey2020',
          controller: VALID_DID,
          publicKeyMultibase: KeysUtility.fromPublicKey(
            didPrivateKey.publicKey,
          ).toMultibase(),
        },
      ],
    });
  });

  describe('deactivating a did', () => {
    let result: DeactivateDIDResult;

    it('should deactivate a DID using provided client options', async () => {
      const clientPrivateKey = await PrivateKey.generateED25519Async();

      const { state, signingRequest } = await generateDeactivateDIDRequest(
        { did: VALID_DID },
        {
          clientOptions: {
            network: 'testnet',
            privateKey: clientPrivateKey,
            accountId: '0.0.12345',
          },
        },
      );

      const signature = didPrivateKey.sign(signingRequest.serializedPayload);

      result = await submitDeactivateDIDRequest(
        { state, signature },
        {
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

      const { state, signingRequest } = await generateDeactivateDIDRequest(
        { did: VALID_DID },
        {
          client,
        },
      );

      const signature = didPrivateKey.sign(signingRequest.serializedPayload);

      result = await submitDeactivateDIDRequest(
        { state, signature },
        {
          client,
        },
      );
    });

    it('should deactivate a DID using provided publisher', async () => {
      const publisher = new TestPublisher();

      const { state, signingRequest } = await generateDeactivateDIDRequest(
        { did: VALID_DID },
        {
          publisher,
        },
      );

      const signature = didPrivateKey.sign(signingRequest.serializedPayload);

      result = await submitDeactivateDIDRequest(
        { state, signature },
        {
          publisher,
        },
      );

      expect(publisher.publishMock).toHaveBeenCalledTimes(1);
    });

    it('should set message awaiter with proper topic id and network', async () => {
      const publisher = new TestPublisher(jest.fn().mockReturnValue('testnet'));

      const { state, signingRequest } = await generateDeactivateDIDRequest(
        { did: VALID_DID },
        {
          publisher,
        },
      );

      const signature = didPrivateKey.sign(signingRequest.serializedPayload);

      result = await submitDeactivateDIDRequest(
        { state, signature },
        {
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

      const { state, signingRequest } = await generateDeactivateDIDRequest(
        { did: VALID_DID },
        {
          publisher,
        },
      );

      const signature = didPrivateKey.sign(signingRequest.serializedPayload);

      result = await submitDeactivateDIDRequest(
        { state, signature },
        {
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

      const { state, signingRequest } = await generateDeactivateDIDRequest(
        { did: VALID_DID },
        {
          publisher,
        },
      );

      const signature = didPrivateKey.sign(signingRequest.serializedPayload);

      result = await submitDeactivateDIDRequest(
        { state, signature, waitForDIDVisibility: false },
        {
          publisher,
        },
      );

      expect(MessageAwaiterWaitMock).not.toHaveBeenCalled();
    });

    it('should set a message awaiter different timeout', async () => {
      const publisher = new TestPublisher();

      const { state, signingRequest } = await generateDeactivateDIDRequest(
        { did: VALID_DID },
        {
          publisher,
        },
      );

      const signature = didPrivateKey.sign(signingRequest.serializedPayload);

      result = await submitDeactivateDIDRequest(
        { state, signature, visibilityTimeoutMs: 1 },
        {
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

  it('should throw an error when invalid signature is provided', async () => {
    const publisher = new TestPublisher();

    const { state } = await generateDeactivateDIDRequest(
      { did: VALID_DID },
      {
        publisher,
      },
    );

    const signature = new Uint8Array(64);

    await expect(
      submitDeactivateDIDRequest(
        { state, signature },
        {
          publisher,
        },
      ),
    ).rejects.toThrow('The signature is invalid');
  });
});
