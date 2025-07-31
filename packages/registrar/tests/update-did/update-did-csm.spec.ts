/* eslint-disable @typescript-eslint/no-unsafe-return */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
import {
  TopicMessageSubmitTransactionMock,
  MessageAwaiterForMessagesMock,
  MessageAwaiterConstructorMock,
  MessageAwaiterWaitMock,
  MessageAwaiterWithTimeoutMock,
} from '../mocks';
import { Buffer } from 'buffer';
import { Client, PrivateKey } from '@hashgraph/sdk';
import {
  DID_ROOT_KEY_ID,
  KeysUtility,
  VerificationMethod,
} from '@hiero-did-sdk/core';
import {
  generateUpdateDIDRequest,
  submitUpdateDIDRequest,
  UpdateDIDRequest,
  UpdateDIDResult,
} from '../../src';
import {
  VALID_DID_TOPIC_ID,
  TestPublisher,
  TestSigner,
  VALID_DID,
  PUBLIC_KEY_MULTIBASE,
} from '../helpers';
import * as UpdateSubOperations from '../../src/update-did/sub-operations';

const didDocumentMock = jest.fn();
jest.mock('@hiero-did-sdk/resolver', () => {
  return {
    resolveDID: jest.fn().mockImplementation((...args) =>
      // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
      Promise.resolve(didDocumentMock(...args)),
    ),
  };
});

describe('Update DID operation', () => {
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

  let didPrivateKey: PrivateKey;
  let rootVerificationMethod: VerificationMethod;

  const executeSigningRequest = (
    signingRequests: UpdateDIDRequest['signingRequests'],
  ): Record<string, Uint8Array> => {
    const signatures = Object.keys(signingRequests).reduce((acc, request) => {
      const signingRequest = signingRequests[request];
      const signature = didPrivateKey.sign(signingRequest.serializedPayload);

      return {
        ...acc,
        [request]: signature,
      };
    }, {});

    return signatures;
  };

  beforeEach(async () => {
    jest.clearAllMocks();

    didPrivateKey = await PrivateKey.generateED25519Async();

    rootVerificationMethod = {
      id: DID_ROOT_KEY_ID,
      type: 'Ed25519VerificationKey2020',
      controller: VALID_DID,
      publicKeyMultibase: KeysUtility.fromPublicKey(
        didPrivateKey.publicKey,
      ).toMultibase(),
    };

    didDocumentMock.mockResolvedValue({
      id: VALID_DID,
      controller: VALID_DID,
      verificationMethod: [
        {
          id: '#test',
          publicKeyMultibase: PUBLIC_KEY_MULTIBASE,
        },
        rootVerificationMethod,
      ],
    });
  });

  describe('Provider options', () => {
    let result: UpdateDIDResult;

    it('should update a DID using provided client options', async () => {
      const clientPrivateKey = await PrivateKey.generateED25519Async();

      const { states, signingRequests } = await generateUpdateDIDRequest(
        {
          did: VALID_DID,
          updates: [
            {
              operation: 'remove-verification-method',
              id: '#test',
            },
          ],
        },
        {
          clientOptions: {
            network: 'testnet',
            privateKey: clientPrivateKey,
            accountId: '0.0.12345',
          },
        },
      );

      const signatures = executeSigningRequest(signingRequests);

      result = await submitUpdateDIDRequest(
        { states, signatures },
        {
          clientOptions: {
            network: 'testnet',
            privateKey: clientPrivateKey,
            accountId: '0.0.12345',
          },
        },
      );
    });

    it('should update a DID using provided client', async () => {
      const clientPrivateKey = await PrivateKey.generateED25519Async();
      const client = Client.forName('testnet').setOperator(
        '0.0.12345',
        clientPrivateKey,
      );

      const { states, signingRequests } = await generateUpdateDIDRequest(
        {
          did: VALID_DID,
          updates: [
            {
              operation: 'remove-verification-method',
              id: '#test',
            },
          ],
        },
        {
          client,
        },
      );

      const signatures = executeSigningRequest(signingRequests);

      result = await submitUpdateDIDRequest(
        { states, signatures },
        {
          client,
        },
      );
    });

    it('should update a DID using provided publisher', async () => {
      const publisher = new TestPublisher();

      const { states, signingRequests } = await generateUpdateDIDRequest(
        {
          did: VALID_DID,
          updates: [
            {
              operation: 'remove-verification-method',
              id: '#test',
            },
          ],
        },
        {
          publisher,
        },
      );

      const signatures = executeSigningRequest(signingRequests);

      result = await submitUpdateDIDRequest(
        { states, signatures },
        {
          publisher,
        },
      );

      expect(publisher.publishMock).toHaveBeenCalledTimes(1);
    });

    afterEach(() => {
      expect(result).toMatchObject({
        did: VALID_DID,
      });

      expect(
        TopicMessageSubmitTransactionMockImplementation.setTopicId,
      ).toHaveBeenCalledWith(VALID_DID_TOPIC_ID);
      expect(
        TopicMessageSubmitTransactionMockImplementation.setMessage,
      ).toHaveBeenCalledWith(expect.any(String));
    });
  });

  describe('Update operations', () => {
    let signer: TestSigner;
    let publisher: TestPublisher;

    beforeAll(() => {
      publisher = new TestPublisher();

      signer = new TestSigner();
      signer.signMock.mockResolvedValue('test-signature');
    });

    it('should take a single update operation', async () => {
      const { states, signingRequests } = await generateUpdateDIDRequest(
        {
          did: VALID_DID,
          updates: {
            operation: 'remove-verification-method',
            id: '#test',
          },
        },
        { publisher },
      );

      const signatures = executeSigningRequest(signingRequests);

      const result = await submitUpdateDIDRequest(
        { states, signatures },
        {
          publisher,
        },
      );

      expect(result.didDocument).toBeDefined();
    });

    it('should take a batch of update operations', async () => {
      const { states, signingRequests } = await generateUpdateDIDRequest(
        {
          did: VALID_DID,
          updates: [
            {
              operation: 'remove-verification-method',
              id: '#test',
            },
            {
              operation: 'add-verification-method',
              id: '#test-vm',
              property: 'verificationMethod',
              publicKeyMultibase: PUBLIC_KEY_MULTIBASE,
            },
            {
              operation: 'add-service',
              id: '#test-service',
              type: 'ServiceType',
              serviceEndpoint: 'http://example.com',
            },
            {
              operation: 'remove-service',
              id: '#test',
            },
          ],
        },
        { publisher },
      );

      const signatures = executeSigningRequest(signingRequests);

      const result = await submitUpdateDIDRequest(
        { states, signatures },
        {
          publisher,
        },
      );

      expect(result.didDocument).toBeDefined();
    });

    it('should apply update operations in order', async () => {
      const updateOperationsMock = jest.spyOn(
        UpdateSubOperations,
        'prepareOperation',
      );

      const firstOperation = {
        operation: 'add-verification-method',
        id: '#test-vm',
        property: 'verificationMethod',
        publicKeyMultibase: PUBLIC_KEY_MULTIBASE,
      } as const;

      const secondOperation = {
        operation: 'add-service',
        id: '#test-service',
        type: 'ServiceType',
        serviceEndpoint: 'http://example.com',
      } as const;

      const { states, signingRequests } = await generateUpdateDIDRequest(
        {
          did: VALID_DID,
          updates: [firstOperation, secondOperation],
        },
        { publisher },
      );

      const signatures = executeSigningRequest(signingRequests);

      const result = await submitUpdateDIDRequest(
        { states, signatures },
        {
          publisher,
        },
      );

      expect(result).toBeDefined();
      expect(updateOperationsMock).toHaveBeenCalledTimes(2);

      expect(updateOperationsMock.mock.calls[0][0]).toMatchObject(
        firstOperation,
      );
      expect(updateOperationsMock.mock.calls[1][0]).toMatchObject(
        secondOperation,
      );
    });

    it('should execute update operations in order', async () => {
      const updateOperationsMock = jest.spyOn(
        UpdateSubOperations,
        'executeOperation',
      );

      const firstOperation = {
        operation: 'add-verification-method',
        id: '#test-vm',
        property: 'verificationMethod',
        publicKeyMultibase: PUBLIC_KEY_MULTIBASE,
      } as const;

      const secondOperation = {
        operation: 'add-service',
        id: '#test-service',
        type: 'ServiceType',
        serviceEndpoint: 'http://example.com',
      } as const;

      const { states, signingRequests } = await generateUpdateDIDRequest(
        {
          did: VALID_DID,
          updates: [firstOperation, secondOperation],
        },
        { publisher },
      );

      const signatures = executeSigningRequest(signingRequests);

      const result = await submitUpdateDIDRequest(
        { states, signatures },
        {
          publisher,
        },
      );

      expect(result).toBeDefined();
      expect(updateOperationsMock).toHaveBeenCalledTimes(2);

      expect(updateOperationsMock.mock.calls[0][0]).toBe(
        firstOperation.operation,
      );
      expect(updateOperationsMock.mock.calls[1][0]).toBe(
        secondOperation.operation,
      );
    });

    it('should execute all update operations', async () => {
      const updateOperationsMock = jest.spyOn(
        UpdateSubOperations,
        'executeOperation',
      );

      const { states, signingRequests } = await generateUpdateDIDRequest(
        {
          did: VALID_DID,
          updates: [
            {
              operation: 'remove-verification-method',
              id: '#test',
            },
            {
              operation: 'add-verification-method',
              id: '#test2',
              property: 'verificationMethod',
              publicKeyMultibase: PUBLIC_KEY_MULTIBASE,
            },
            {
              operation: 'remove-service',
              id: '#test',
            },
          ],
        },
        { publisher },
      );

      const signatures = executeSigningRequest(signingRequests);

      await submitUpdateDIDRequest(
        { states, signatures },
        {
          publisher,
        },
      );

      expect(updateOperationsMock).toHaveBeenCalledTimes(3);
    });

    it('should throw an error if verification method already exists', async () => {
      await expect(
        generateUpdateDIDRequest(
          {
            did: VALID_DID,
            updates: [
              {
                operation: 'add-verification-method',
                id: '#test',
                property: 'verificationMethod',
                publicKeyMultibase: PUBLIC_KEY_MULTIBASE,
              },
            ],
          },
          {
            publisher,
          },
        ),
      ).rejects.toThrow();
    });

    it('should throw an error if service already exists', async () => {
      didDocumentMock.mockReturnValue({
        id: VALID_DID,
        controller: VALID_DID,
        service: [{ id: '#test' }],
      });

      await expect(
        generateUpdateDIDRequest(
          {
            did: VALID_DID,
            updates: [
              {
                operation: 'add-service',
                id: '#test',
                type: 'ServiceType',
                serviceEndpoint: 'http://example.com',
              },
            ],
          },
          { publisher },
        ),
      ).rejects.toThrow();
    });

    it('should return the updated DID document', async () => {
      jest.clearAllMocks();

      const didDocument = {
        id: VALID_DID,
        controller: VALID_DID,
        keyAgreement: [`${VALID_DID}#test`],
        verificationMethod: [
          {
            id: '#test',
          },
          rootVerificationMethod,
        ],
      };

      didDocumentMock.mockReturnValue(didDocument);

      const { states, signingRequests } = await generateUpdateDIDRequest(
        {
          did: VALID_DID,
          updates: [
            {
              operation: 'add-verification-method',
              id: '#new-vm',
              property: 'verificationMethod',
              publicKeyMultibase: PUBLIC_KEY_MULTIBASE,
            },
          ],
        },
        { publisher },
      );

      const signatures = executeSigningRequest(signingRequests);

      const result = await submitUpdateDIDRequest(
        { states, signatures },
        {
          publisher,
        },
      );

      expect(result.didDocument).toBeDefined();
      expect(result.didDocument).toBe(didDocument);
    });

    it('should not perform any updates when update array is empty', async () => {
      const updateOperationsMock = jest.spyOn(
        UpdateSubOperations,
        'prepareOperation',
      );

      const { states, signingRequests } = await generateUpdateDIDRequest(
        {
          did: VALID_DID,
          updates: [],
        },
        { publisher },
      );

      expect(states).toHaveLength(0);
      expect(signingRequests).toStrictEqual({});
      expect(updateOperationsMock).not.toHaveBeenCalled();
    });

    it('should throw an error when verification method to remove is not existing within current did document', async () => {
      didDocumentMock.mockResolvedValue({
        id: VALID_DID,
        controller: VALID_DID,
        verificationMethod: [
          {
            id: '#test',
          },
          rootVerificationMethod,
        ],
        authentication: [
          {
            id: '#test-auth',
          },
        ],
        keyAgreement: [
          {
            id: '#test-ka',
          },
        ],
      });

      await expect(
        generateUpdateDIDRequest(
          {
            did: VALID_DID,
            updates: [
              {
                operation: 'remove-verification-method',
                id: '#not-existing',
              },
            ],
          },
          { publisher },
        ),
      ).rejects.toThrow(
        'Verification method ID does not exist. Nothing to remove',
      );
    });

    it('should throw an error when verification method to remove is a service', async () => {
      didDocumentMock.mockResolvedValue({
        id: VALID_DID,
        controller: VALID_DID,
        verificationMethod: [rootVerificationMethod],
        service: [
          {
            id: '#srv',
          },
        ],
      });

      await expect(
        generateUpdateDIDRequest(
          {
            did: VALID_DID,
            updates: [
              {
                operation: 'remove-verification-method',
                id: '#srv',
              },
            ],
          },
          { publisher },
        ),
      ).rejects.toThrow(
        'Cannot remove a service using `remove-verification-method` operation',
      );
    });

    it('should throw an error when verification method to remove is a service', async () => {
      didDocumentMock.mockResolvedValue({
        id: VALID_DID,
        controller: VALID_DID,
        verificationMethod: [rootVerificationMethod],
        service: [
          {
            id: '#srv',
          },
        ],
      });

      await expect(
        generateUpdateDIDRequest(
          {
            did: VALID_DID,
            updates: [
              {
                operation: 'remove-verification-method',
                id: '#srv',
              },
            ],
          },
          { publisher },
        ),
      ).rejects.toThrow(
        'Cannot remove a service using `remove-verification-method` operation',
      );
    });

    it('should throw an error when verification method does not have a public key included', async () => {
      didDocumentMock.mockResolvedValue({
        id: VALID_DID,
        controller: VALID_DID,
        verificationMethod: [rootVerificationMethod],
      });

      await expect(
        generateUpdateDIDRequest(
          {
            did: VALID_DID,
            updates: [
              {
                operation: 'add-verification-method',
                id: '#test',
                property: 'verificationMethod',
              },
            ],
          },
          { publisher },
        ),
      ).rejects.toThrow('The public key is required for verification methods');
    });

    it('should throw an error when a duplicate id with different key is being added', async () => {
      didDocumentMock.mockResolvedValue({
        id: VALID_DID,
        controller: VALID_DID,
        verificationMethod: [
          {
            id: '#test',
            publicKeyMultibase: 'test',
          },
          rootVerificationMethod,
        ],
      });

      await expect(
        generateUpdateDIDRequest(
          {
            did: VALID_DID,
            updates: [
              {
                operation: 'add-verification-method',
                id: '#test',
                property: 'verificationMethod',
                publicKeyMultibase: PUBLIC_KEY_MULTIBASE,
              },
            ],
          },
          { publisher },
        ),
      ).rejects.toThrow(
        `The fragment ID '#test' is already in use for another verification method`,
      );
    });

    it('should throw an error when an alias is being added for verification method', async () => {
      didDocumentMock.mockResolvedValue({
        id: VALID_DID,
        controller: VALID_DID,
        verificationMethod: [
          {
            id: '#test',
            publicKeyMultibase: PUBLIC_KEY_MULTIBASE,
          },
          rootVerificationMethod,
        ],
      });

      await expect(
        generateUpdateDIDRequest(
          {
            did: VALID_DID,
            updates: [
              {
                operation: 'add-verification-method',
                id: '#test',
                property: 'verificationMethod',
                publicKeyMultibase: PUBLIC_KEY_MULTIBASE,
              },
            ],
          },
          { publisher },
        ),
      ).rejects.toThrow(
        `The fragment ID '#test' is already in use for another verification method`,
      );
    });

    it('should add an alias for verification method with providing the same key', async () => {
      didDocumentMock.mockResolvedValue({
        id: VALID_DID,
        controller: VALID_DID,
        verificationMethod: [
          {
            id: '#test',
            publicKeyMultibase: PUBLIC_KEY_MULTIBASE,
          },
          rootVerificationMethod,
        ],
      });

      const { states, signingRequests } = await generateUpdateDIDRequest(
        {
          did: VALID_DID,
          updates: [
            {
              operation: 'add-verification-method',
              id: '#test',
              property: 'assertionMethod',
              publicKeyMultibase: PUBLIC_KEY_MULTIBASE,
            },
          ],
        },
        { publisher },
      );

      const signatures = executeSigningRequest(signingRequests);

      await submitUpdateDIDRequest(
        { states, signatures },
        {
          publisher,
        },
      );

      const submittedMessage = JSON.parse(
        TopicMessageSubmitTransactionMockImplementation.setMessage.mock
          .calls[0] as string,
      );
      const submittedEvent = JSON.parse(
        Buffer.from(
          submittedMessage.message.event as string,
          'base64',
        ).toString('utf-8'),
      );

      expect(submittedEvent).toStrictEqual({
        VerificationRelationship: {
          id: `${VALID_DID}#test`,
          type: expect.any(String),
          controller: VALID_DID,
          publicKeyMultibase: PUBLIC_KEY_MULTIBASE,
          relationshipType: 'assertionMethod',
        },
      });
    });

    it('should add an alias for verification method with not providing a key', async () => {
      didDocumentMock.mockResolvedValue({
        id: VALID_DID,
        controller: VALID_DID,
        verificationMethod: [
          {
            id: '#test',
            publicKeyMultibase: PUBLIC_KEY_MULTIBASE,
          },
          rootVerificationMethod,
        ],
      });

      const { states, signingRequests } = await generateUpdateDIDRequest(
        {
          did: VALID_DID,
          updates: [
            {
              operation: 'add-verification-method',
              id: '#test',
              property: 'assertionMethod',
            },
          ],
        },
        { publisher },
      );

      const signatures = executeSigningRequest(signingRequests);

      await submitUpdateDIDRequest(
        { states, signatures },
        {
          publisher,
        },
      );

      const submittedMessage = JSON.parse(
        TopicMessageSubmitTransactionMockImplementation.setMessage.mock
          .calls[0] as string,
      );
      const submittedEvent = JSON.parse(
        Buffer.from(
          submittedMessage.message.event as string,
          'base64',
        ).toString('utf-8'),
      );

      expect(submittedEvent).toStrictEqual({
        VerificationRelationship: {
          id: `${VALID_DID}#test`,
          type: expect.any(String),
          controller: VALID_DID,
          publicKeyMultibase: PUBLIC_KEY_MULTIBASE,
          relationshipType: 'assertionMethod',
        },
      });
    });

    it('should pass the topic reader to the resolver', async () => {
      const topicReader = {
        fetchAllToDate: jest.fn().mockResolvedValue([]),
        fetchFrom: jest.fn().mockResolvedValue([]),
      };

      didDocumentMock.mockResolvedValue({
        id: VALID_DID,
        controller: VALID_DID,
        verificationMethod: [rootVerificationMethod],
      });

      const { states, signingRequests } = await generateUpdateDIDRequest(
        {
          did: VALID_DID,
          updates: [
            {
              operation: 'add-verification-method',
              id: '#test',
              property: 'assertionMethod',
              publicKeyMultibase: PUBLIC_KEY_MULTIBASE,
            },
          ],
          topicReader,
        },
        { publisher },
      );

      const signatures = executeSigningRequest(signingRequests);

      await submitUpdateDIDRequest(
        { states, signatures },
        {
          publisher,
        },
      );

      expect(didDocumentMock).toHaveBeenCalledWith(
        VALID_DID,
        'application/did+json',
        {
          topicReader,
        },
      );
    });

    it('should throw an error when request state is empty', async () => {
      await expect(
        submitUpdateDIDRequest(
          {
            states: [],
            signatures: {},
          },
          {
            publisher,
          },
        ),
      ).rejects.toThrow('No states provided');
    });

    it('should throw an error when signatures are empty', async () => {
      const { states } = await generateUpdateDIDRequest(
        {
          did: VALID_DID,
          updates: [
            {
              operation: 'add-verification-method',
              id: '#test',
              property: 'assertionMethod',
            },
          ],
        },
        { publisher },
      );

      await expect(
        submitUpdateDIDRequest(
          { states, signatures: {} },
          {
            publisher,
          },
        ),
      ).rejects.toThrow('Number of states and signatures do not match');
    });

    it('should throw an error when signature is missing', async () => {
      const { states, signingRequests } = await generateUpdateDIDRequest(
        {
          did: VALID_DID,
          updates: [
            {
              operation: 'add-verification-method',
              id: '#test',
              property: 'assertionMethod',
            },
            {
              operation: 'add-verification-method',
              id: '#test',
              property: 'authentication',
            },
          ],
        },
        { publisher },
      );

      const signatures = executeSigningRequest(signingRequests);

      delete signatures[Object.keys(signatures)[1]];

      signatures['test'] = Buffer.from('test-signature');

      await expect(
        submitUpdateDIDRequest(
          { states, signatures },
          {
            publisher,
          },
        ),
      ).rejects.toThrow('Signature for sr-2 not found');
    });

    it('should throw an error when signature is invalid', async () => {
      const { states, signingRequests } = await generateUpdateDIDRequest(
        {
          did: VALID_DID,
          updates: [
            {
              operation: 'add-verification-method',
              id: '#test',
              property: 'assertionMethod',
            },
            {
              operation: 'add-verification-method',
              id: '#test',
              property: 'authentication',
            },
          ],
        },
        { publisher },
      );

      const signatures = executeSigningRequest(signingRequests);

      signatures[Object.keys(signatures)[1]] = new Uint8Array(64);

      await expect(
        submitUpdateDIDRequest(
          { states, signatures },
          {
            publisher,
          },
        ),
      ).rejects.toThrow('The signature is invalid');
    });
  });

  describe('Message awaiting', () => {
    const publisher = new TestPublisher(jest.fn().mockReturnValue('testnet'));
    const signer = new TestSigner();
    signer.signMock.mockResolvedValue('test-signature');

    it('should set message awaiter with proper topic id and network', async () => {
      const { states, signingRequests } = await generateUpdateDIDRequest(
        {
          did: VALID_DID,
          updates: {
            operation: 'remove-verification-method',
            id: '#test',
          },
        },
        { publisher },
      );

      const signatures = executeSigningRequest(signingRequests);

      await submitUpdateDIDRequest(
        { states, signatures },
        {
          publisher,
        },
      );

      expect(MessageAwaiterConstructorMock).toHaveBeenCalledWith([
        VALID_DID_TOPIC_ID,
        'testnet',
      ]);
    });

    it('should set message awaiter for a created messages', async () => {
      const { states, signingRequests } = await generateUpdateDIDRequest(
        {
          did: VALID_DID,
          updates: [
            {
              operation: 'remove-verification-method',
              id: '#test',
            },
            {
              operation: 'remove-service',
              id: '#test',
            },
            {
              operation: 'add-service',
              id: '#test-service',
              serviceEndpoint: 'http://example.com',
              type: 'ServiceType',
            },
            {
              operation: 'add-verification-method',
              id: '#test-vm',
              property: 'verificationMethod',
              publicKeyMultibase: PUBLIC_KEY_MULTIBASE,
            },
          ],
        },
        { publisher },
      );

      const signatures = executeSigningRequest(signingRequests);

      await submitUpdateDIDRequest(
        { states, signatures },
        {
          publisher,
        },
      );

      expect(
        TopicMessageSubmitTransactionMockImplementation.setMessage.mock.calls,
      ).toHaveLength(4);

      const messages =
        TopicMessageSubmitTransactionMockImplementation.setMessage.mock.calls.map(
          (call) => call[0],
        );

      expect(MessageAwaiterForMessagesMock).toHaveBeenCalledWith(messages);
    });

    it('should not call wait method when messageAwaiting is set to false', async () => {
      const { states, signingRequests } = await generateUpdateDIDRequest(
        {
          did: VALID_DID,
          updates: {
            operation: 'remove-verification-method',
            id: '#test',
          },
        },
        { publisher },
      );

      const signatures = executeSigningRequest(signingRequests);

      await submitUpdateDIDRequest(
        { states, signatures, waitForDIDVisibility: false },
        {
          publisher,
        },
      );

      expect(MessageAwaiterWaitMock).not.toHaveBeenCalled();
    });

    it('should set a message awaiter different timeout', async () => {
      const { states, signingRequests } = await generateUpdateDIDRequest(
        {
          did: VALID_DID,

          updates: {
            operation: 'remove-verification-method',
            id: '#test',
          },
        },
        { publisher },
      );

      const signatures = executeSigningRequest(signingRequests);

      await submitUpdateDIDRequest(
        { states, signatures, visibilityTimeoutMs: 1 },
        {
          publisher,
        },
      );

      expect(MessageAwaiterWithTimeoutMock).toHaveBeenCalledWith(1);
    });
  });
});
