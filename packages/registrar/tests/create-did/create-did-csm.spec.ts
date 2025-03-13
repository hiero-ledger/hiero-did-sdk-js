/* eslint-disable @typescript-eslint/no-unsafe-member-access */
import {
  TopicCreateTransactionMock,
  TopicMessageSubmitTransactionMock,
  MessageAwaiterForMessagesMock,
  MessageAwaiterConstructorMock,
  MessageAwaiterWaitMock,
  MessageAwaiterWithTimeoutMock,
} from '../mocks';

import { Client, PrivateKey } from '@hashgraph/sdk';
import { resolveDID } from '@swiss-digital-assets-institute/resolver';
import { DIDError } from '@swiss-digital-assets-institute/core';
import {
  generateCreateDIDRequest,
  submitCreateDIDRequest,
  CreateDIDResult,
} from '../../src';
import {
  CREATED_TOPIC_ID,
  OPERATOR_PUBLIC_KEY,
  TestPublisher,
  TestSigner,
  VALID_DID,
} from '../helpers';
import { KeysUtility } from '@swiss-digital-assets-institute/core';

const notFoundError = new DIDError('notFound', 'DID not found');
jest.mock('@swiss-digital-assets-institute/resolver', () => {
  return {
    resolveDID: jest.fn().mockImplementation(() => {
      throw notFoundError;
    }),
  };
});

const resolverMock = resolveDID as jest.Mock;

describe('Create DID operation in Client-Secret Mode', () => {
  const TopicCreateTransactionMockImplementation = {
    setAdminKey: jest.fn().mockReturnThis(),
    setSubmitKey: jest.fn().mockReturnThis(),
    execute: jest.fn().mockResolvedValue({
      getReceipt: jest.fn().mockResolvedValue({ topicId: CREATED_TOPIC_ID }),
    }),
  };

  const TopicMessageSubmitTransactionMockImplementation = {
    setTopicId: jest.fn().mockReturnThis(),
    setMessage: jest.fn().mockReturnThis(),
    execute: jest.fn().mockResolvedValue({
      getReceipt: jest.fn(),
    }),
  };

  TopicCreateTransactionMock.mockImplementation(
    () => TopicCreateTransactionMockImplementation,
  );
  TopicMessageSubmitTransactionMock.mockImplementation(
    () => TopicMessageSubmitTransactionMockImplementation,
  );

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Provider options', () => {
    let result: CreateDIDResult;

    it('should create a new DID using provided client options', async () => {
      const clientPrivateKey = await PrivateKey.generateED25519Async();
      const didPrivateKey = await PrivateKey.generateED25519Async();

      const request = await generateCreateDIDRequest(
        {
          multibasePublicKey: KeysUtility.fromPublicKey(
            didPrivateKey.publicKey,
          ).toMultibase(),
        },
        {
          clientOptions: {
            network: 'testnet',
            privateKey: clientPrivateKey,
            accountId: '0.0.12345',
          },
        },
      );

      const signature = didPrivateKey.sign(
        request.signingRequest.serializedPayload,
      );

      result = await submitCreateDIDRequest(
        { state: request.state, signature },
        {
          clientOptions: {
            network: 'testnet',
            privateKey: clientPrivateKey,
            accountId: '0.0.12345',
          },
        },
      );
    });

    it('should create a new DID using provided client', async () => {
      const didPrivateKey = await PrivateKey.generateED25519Async();
      const clientPrivateKey = await PrivateKey.generateED25519Async();
      const client = Client.forName('testnet').setOperator(
        '0.0.12345',
        clientPrivateKey,
      );

      const request = await generateCreateDIDRequest(
        {
          multibasePublicKey: KeysUtility.fromPublicKey(
            didPrivateKey.publicKey,
          ).toMultibase(),
        },
        {
          client,
        },
      );

      const signature = didPrivateKey.sign(
        request.signingRequest.serializedPayload,
      );

      result = await submitCreateDIDRequest(
        { state: request.state, signature },
        {
          client,
        },
      );
    });

    it('should create a new DID using provided publisher', async () => {
      const publisher = new TestPublisher();
      publisher.publishMock.mockResolvedValue({ topicId: CREATED_TOPIC_ID });
      publisher.networkMock.mockReturnValue('testnet');
      publisher.publicKeyMock.mockReturnValue(OPERATOR_PUBLIC_KEY);

      const didPrivateKey = await PrivateKey.generateED25519Async();

      const request = await generateCreateDIDRequest(
        {
          multibasePublicKey: KeysUtility.fromPublicKey(
            didPrivateKey.publicKey,
          ).toMultibase(),
        },
        {
          publisher,
        },
      );

      const signature = didPrivateKey.sign(
        request.signingRequest.serializedPayload,
      );

      result = await submitCreateDIDRequest(
        { state: request.state, signature },
        {
          publisher,
        },
      );

      expect(publisher.publishMock).toHaveBeenCalledTimes(2);
    });

    afterEach(() => {
      expect(result).toMatchObject({
        did: expect.any(String),
      });
      expect(result.didDocument).toMatchObject({
        id: result.did,
        controller: expect.any(String),
        verificationMethod: [
          {
            id: `${result.did}#did-root-key`,
            type: 'Ed25519VerificationKey2020',
            controller: result.didDocument.controller,
            publicKeyMultibase: expect.any(String),
          },
        ],
      });

      expect(
        TopicCreateTransactionMockImplementation.setAdminKey,
      ).toHaveBeenCalledWith(OPERATOR_PUBLIC_KEY);
      expect(
        TopicCreateTransactionMockImplementation.setSubmitKey,
      ).toHaveBeenCalledWith(OPERATOR_PUBLIC_KEY);
      expect(
        TopicMessageSubmitTransactionMockImplementation.setTopicId,
      ).toHaveBeenCalledWith(CREATED_TOPIC_ID);
      expect(
        TopicMessageSubmitTransactionMockImplementation.setMessage,
      ).toHaveBeenCalledWith(expect.any(String));
    });
  });

  describe('Operation options', () => {
    let signer: TestSigner;
    let publisher: TestPublisher;

    beforeAll(async () => {
      publisher = new TestPublisher();
      publisher.publishMock.mockResolvedValue({ topicId: CREATED_TOPIC_ID });
      publisher.networkMock.mockReturnValue('testnet');
      publisher.publicKeyMock.mockReturnValue(OPERATOR_PUBLIC_KEY);

      const privateKey = await PrivateKey.generateED25519Async();
      signer = new TestSigner();
      signer.publicKeyMock.mockResolvedValue(
        privateKey.publicKey.toStringDer(),
      );
      signer.signMock.mockResolvedValue('test-signature');
    });

    it('should create a new DID using provided controller', async () => {
      const didPrivateKey = await PrivateKey.generateED25519Async();
      const request = await generateCreateDIDRequest(
        {
          controller: VALID_DID,
          multibasePublicKey: KeysUtility.fromPublicKey(
            didPrivateKey.publicKey,
          ).toMultibase(),
        },
        { publisher },
      );

      const signature = didPrivateKey.sign(
        request.signingRequest.serializedPayload,
      );

      const result = await submitCreateDIDRequest(
        { state: request.state, signature },
        {
          publisher,
        },
      );

      expect(result.didDocument.controller).toBe(VALID_DID);
    });

    it('should create a new DID using provided topic ID', async () => {
      const didPrivateKey = await PrivateKey.generateED25519Async();
      const request = await generateCreateDIDRequest(
        {
          multibasePublicKey: KeysUtility.fromPublicKey(
            didPrivateKey.publicKey,
          ).toMultibase(),
          topicId: CREATED_TOPIC_ID,
        },
        { publisher },
      );

      const signature = didPrivateKey.sign(
        request.signingRequest.serializedPayload,
      );

      const result = await submitCreateDIDRequest(
        { state: request.state, signature },
        {
          publisher,
        },
      );

      expect(result.did).toContain(CREATED_TOPIC_ID);
    });

    it('should throw an error when invalid signature is provided', async () => {
      const didPrivateKey = await PrivateKey.generateED25519Async();
      const request = await generateCreateDIDRequest(
        {
          controller: VALID_DID,
          multibasePublicKey: KeysUtility.fromPublicKey(
            didPrivateKey.publicKey,
          ).toMultibase(),
        },
        { publisher },
      );

      const signature = new Uint8Array(64);

      await expect(
        submitCreateDIDRequest(
          { state: request.state, signature },
          {
            publisher,
          },
        ),
      ).rejects.toThrow('The signature is invalid');
    });
  });

  it('should set message awaiter with proper topic id and network', async () => {
    const didPrivateKey = await PrivateKey.generateED25519Async();
    const clientPrivateKey = await PrivateKey.generateED25519Async();

    const request = await generateCreateDIDRequest(
      {
        multibasePublicKey: KeysUtility.fromPublicKey(
          didPrivateKey.publicKey,
        ).toMultibase(),
        topicId: CREATED_TOPIC_ID,
      },
      {
        clientOptions: {
          network: 'testnet',
          privateKey: clientPrivateKey,
          accountId: '0.0.12345',
        },
      },
    );

    const signature = didPrivateKey.sign(
      request.signingRequest.serializedPayload,
    );

    await submitCreateDIDRequest(
      { state: request.state, signature },
      {
        clientOptions: {
          network: 'testnet',
          privateKey: clientPrivateKey,
          accountId: '0.0.12345',
        },
      },
    );

    expect(MessageAwaiterConstructorMock).toHaveBeenCalledWith([
      CREATED_TOPIC_ID,
      'testnet',
    ]);
  });

  it('should set message awaiter for a created message', async () => {
    const clientPrivateKey = await PrivateKey.generateED25519Async();
    const didPrivateKey = await PrivateKey.generateED25519Async();

    const request = await generateCreateDIDRequest(
      {
        multibasePublicKey: KeysUtility.fromPublicKey(
          didPrivateKey.publicKey,
        ).toMultibase(),
      },
      {
        clientOptions: {
          network: 'testnet',
          privateKey: clientPrivateKey,
          accountId: '0.0.12345',
        },
      },
    );

    const signature = didPrivateKey.sign(
      request.signingRequest.serializedPayload,
    );

    await submitCreateDIDRequest(
      { state: request.state, signature },
      {
        clientOptions: {
          network: 'testnet',
          privateKey: clientPrivateKey,
          accountId: '0.0.12345',
        },
      },
    );

    const message =
      TopicMessageSubmitTransactionMockImplementation.setMessage.mock
        .calls[0][0];

    expect(MessageAwaiterForMessagesMock).toHaveBeenCalledWith([message]);
  });

  it('should not call wait method when messageAwaiting is set to false', async () => {
    const clientPrivateKey = await PrivateKey.generateED25519Async();
    const didPrivateKey = await PrivateKey.generateED25519Async();

    const request = await generateCreateDIDRequest(
      {
        multibasePublicKey: KeysUtility.fromPublicKey(
          didPrivateKey.publicKey,
        ).toMultibase(),
      },
      {
        clientOptions: {
          network: 'testnet',
          privateKey: clientPrivateKey,
          accountId: '0.0.12345',
        },
      },
    );

    const signature = didPrivateKey.sign(
      request.signingRequest.serializedPayload,
    );

    await submitCreateDIDRequest(
      { state: request.state, signature, waitForDIDVisibility: false },
      {
        clientOptions: {
          network: 'testnet',
          privateKey: clientPrivateKey,
          accountId: '0.0.12345',
        },
      },
    );

    expect(MessageAwaiterWaitMock).not.toHaveBeenCalled();
  });

  it('should set a message awaiter different timeout', async () => {
    const clientPrivateKey = await PrivateKey.generateED25519Async();
    const didPrivateKey = await PrivateKey.generateED25519Async();

    const request = await generateCreateDIDRequest(
      {
        multibasePublicKey: KeysUtility.fromPublicKey(
          didPrivateKey.publicKey,
        ).toMultibase(),
      },
      {
        clientOptions: {
          network: 'testnet',
          privateKey: clientPrivateKey,
          accountId: '0.0.12345',
        },
      },
    );

    const signature = didPrivateKey.sign(
      request.signingRequest.serializedPayload,
    );

    await submitCreateDIDRequest(
      {
        state: request.state,
        signature,
        visibilityTimeoutMs: 1,
      },
      {
        clientOptions: {
          network: 'testnet',
          privateKey: clientPrivateKey,
          accountId: '0.0.12345',
        },
      },
    );

    expect(MessageAwaiterWithTimeoutMock).toHaveBeenCalledWith(1);
  });

  it('should throw an error if DID already exist', async () => {
    const clientPrivateKey = await PrivateKey.generateED25519Async();
    const didPrivateKey = await PrivateKey.generateED25519Async();
    resolverMock.mockResolvedValue({ id: VALID_DID });

    await expect(
      generateCreateDIDRequest(
        {
          multibasePublicKey: KeysUtility.fromPublicKey(
            didPrivateKey.publicKey,
          ).toMultibase(),
        },
        {
          clientOptions: {
            network: 'testnet',
            privateKey: clientPrivateKey,
            accountId: '0.0.12345',
          },
        },
      ),
    ).rejects.toThrow('DID already exists');
  });

  it('should pass the topic reader to the resolver', async () => {
    const clientPrivateKey = await PrivateKey.generateED25519Async();
    const didPrivateKey = await PrivateKey.generateED25519Async();
    resolverMock.mockRejectedValue(notFoundError);
    const topicReader = {
      fetchAllToDate: jest.fn().mockResolvedValue([]),
      fetchFrom: jest.fn().mockResolvedValue([]),
    };

    await generateCreateDIDRequest(
      {
        multibasePublicKey: KeysUtility.fromPublicKey(
          didPrivateKey.publicKey,
        ).toMultibase(),
        topicReader,
      },
      {
        clientOptions: {
          network: 'testnet',
          privateKey: clientPrivateKey,
          accountId: '0.0.12345',
        },
      },
    );

    expect(resolverMock).toHaveBeenCalledWith(
      expect.any(String),
      'application/did+json',
      {
        topicReader,
      },
    );
  });
});
