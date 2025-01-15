/* eslint-disable @typescript-eslint/no-unsafe-return */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
import {
  TopicMessageSubmitTransactionMock,
  MessageAwaiterForMessagesMock,
  MessageAwaiterConstructorMock,
  MessageAwaiterWaitMock,
  MessageAwaiterWithTimeoutMock,
} from './mocks';

import { Client, PrivateKey } from '@hashgraph/sdk';
import { updateDID, UpdateDIDResult } from '../src';
import {
  VALID_DID_TOPIC_ID,
  TestPublisher,
  TestSigner,
  VALID_DID,
  PUBLIC_KEY_MULTIBASE,
} from './helpers';
import * as UpdateSubOperations from '../src/update-did/sub-operations';

const didDocumentMock = jest.fn();
jest.mock('@swiss-digital-assets-institute/resolver', () => {
  return {
    resolveDID: jest
      .fn()
      .mockImplementation(() => Promise.resolve(didDocumentMock())),
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

  beforeEach(() => {
    jest.clearAllMocks();
    didDocumentMock.mockResolvedValue({
      id: VALID_DID,
      controller: VALID_DID,
      verificationMethod: [
        {
          id: '#test',
        },
      ],
    });
  });

  describe('Provider options', () => {
    let result: UpdateDIDResult;
    const defaultSigner = new TestSigner(
      jest.fn().mockResolvedValue('test-signature'),
    );

    it('should update a DID using provided client options', async () => {
      const clientPrivateKey = await PrivateKey.generateED25519Async();

      result = await updateDID(
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
          signer: defaultSigner,
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
      result = await updateDID(
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
          signer: defaultSigner,
          client,
        },
      );
    });

    it('should update a DID using provided publisher', async () => {
      const publisher = new TestPublisher();

      result = await updateDID(
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
          signer: defaultSigner,
          publisher,
        },
      );

      expect(publisher.publishMock).toHaveBeenCalledTimes(1);
    });

    it('should update a DID using provided signer', async () => {
      const publisher = new TestPublisher();

      const privateKey = await PrivateKey.generateED25519Async();
      const signer = new TestSigner();
      signer.publicKeyMock.mockResolvedValue(
        privateKey.publicKey.toStringDer(),
      );
      signer.signMock.mockResolvedValue('test-signature');

      result = await updateDID(
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
          signer,
          publisher,
        },
      );

      expect(signer.signMock).toHaveBeenCalledTimes(1);
    });

    it('should create a new DID using provided private key', async () => {
      const publisher = new TestPublisher();

      const privateKey = await PrivateKey.generateED25519Async();
      const signSpy = jest.spyOn(privateKey, 'sign');

      result = await updateDID(
        {
          did: VALID_DID,
          privateKey,
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

      expect(signSpy).toHaveBeenCalledTimes(1);
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
      const result = await updateDID(
        {
          did: VALID_DID,
          updates: {
            operation: 'remove-verification-method',
            id: '#test',
          },
        },
        { signer, publisher },
      );

      expect(result.didDocument).toBeDefined();
    });

    it('should take a batch of update operations', async () => {
      const result = await updateDID(
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
        { signer, publisher },
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
      const result = await updateDID(
        {
          did: VALID_DID,
          updates: [firstOperation, secondOperation],
        },
        { signer, publisher },
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
      const result = await updateDID(
        {
          did: VALID_DID,
          updates: [firstOperation, secondOperation],
        },
        { signer, publisher },
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

      const result = await updateDID(
        {
          did: VALID_DID,
          updates: [
            {
              operation: 'remove-verification-method',
              id: '#test',
            },
            {
              operation: 'remove-verification-method',
              id: '#test',
            },
            {
              operation: 'remove-service',
              id: '#test',
            },
          ],
        },
        { signer, publisher },
      );

      expect(result).toBeDefined();
      expect(updateOperationsMock).toHaveBeenCalledTimes(3);
    });

    it('should throw an error if verification method already exists', async () => {
      didDocumentMock.mockReturnValue({
        id: VALID_DID,
        controller: VALID_DID,
        verificationMethod: [
          {
            id: '#test',
          },
        ],
      });

      await expect(
        updateDID(
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
            signer,
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
        updateDID(
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
          { signer, publisher },
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
        ],
      };

      didDocumentMock.mockReturnValue(didDocument);

      const result = await updateDID(
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
        { signer, publisher },
      );

      expect(result.didDocument).toBeDefined();
      expect(result.didDocument).toBe(didDocument);
    });

    it('should not perform any updates when update array is empty', async () => {
      const updateOperationsMock = jest.spyOn(
        UpdateSubOperations,
        'executeOperation',
      );

      const result = await updateDID(
        {
          did: VALID_DID,
          updates: [],
        },
        { signer, publisher },
      );

      expect(result).toBeDefined();
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
        updateDID(
          {
            did: VALID_DID,
            updates: [
              {
                operation: 'remove-verification-method',
                id: '#not-existing',
              },
            ],
          },
          { signer, publisher },
        ),
      ).rejects.toThrow(
        'Verification method id does not exist. Nothing to remove',
      );
    });

    it('should throw an error when verification method to remove is a service', async () => {
      didDocumentMock.mockResolvedValue({
        id: VALID_DID,
        controller: VALID_DID,
        service: [
          {
            id: '#srv',
          },
        ],
      });

      await expect(
        updateDID(
          {
            did: VALID_DID,
            updates: [
              {
                operation: 'remove-verification-method',
                id: '#srv',
              },
            ],
          },
          { signer, publisher },
        ),
      ).rejects.toThrow(
        'Cannot remove service using remove-verification-method operation',
      );
    });

    it('should throw an error when verification method to remove is a service', async () => {
      didDocumentMock.mockResolvedValue({
        id: VALID_DID,
        controller: VALID_DID,
        service: [
          {
            id: '#srv',
          },
        ],
      });

      await expect(
        updateDID(
          {
            did: VALID_DID,
            updates: [
              {
                operation: 'remove-verification-method',
                id: '#srv',
              },
            ],
          },
          { signer, publisher },
        ),
      ).rejects.toThrow(
        'Cannot remove service using remove-verification-method operation',
      );
    });

    it('should throw an error when verification method does not have a public key included', async () => {
      didDocumentMock.mockResolvedValue({
        id: VALID_DID,
        controller: VALID_DID,
      });

      await expect(
        updateDID(
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
          { signer, publisher },
        ),
      ).rejects.toThrow('The public key is required for verification methods.');
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
        ],
      });

      await expect(
        updateDID(
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
          { signer, publisher },
        ),
      ).rejects.toThrow(
        'The fragment ID #test is already in use for another verification method.',
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
        ],
      });

      await expect(
        updateDID(
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
          { signer, publisher },
        ),
      ).rejects.toThrow(
        'The fragment ID #test is already in use for another verification method.',
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
        ],
      });

      await updateDID(
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
        { signer, publisher },
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
        ],
      });

      await updateDID(
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
        { signer, publisher },
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
  });

  describe('Message awaiting', () => {
    const publisher = new TestPublisher(jest.fn().mockReturnValue('testnet'));
    const signer = new TestSigner();
    signer.signMock.mockResolvedValue('test-signature');

    it('should set message awaiter with proper topic id and network', async () => {
      await updateDID(
        {
          did: VALID_DID,
          updates: {
            operation: 'remove-verification-method',
            id: '#test',
          },
        },
        { signer, publisher },
      );

      expect(MessageAwaiterConstructorMock).toHaveBeenCalledWith([
        VALID_DID_TOPIC_ID,
        'testnet',
      ]);
    });

    it('should set message awaiter for a created messages', async () => {
      await updateDID(
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
        { signer, publisher },
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
      await updateDID(
        {
          did: VALID_DID,
          waitForDIDVisibility: false,
          updates: {
            operation: 'remove-verification-method',
            id: '#test',
          },
        },
        { signer, publisher },
      );

      expect(MessageAwaiterWaitMock).not.toHaveBeenCalled();
    });

    it('should set a message awaiter different timeout', async () => {
      await updateDID(
        {
          did: VALID_DID,
          visibilityTimeoutMs: 1,
          updates: {
            operation: 'remove-verification-method',
            id: '#test',
          },
        },
        { signer, publisher },
      );

      expect(MessageAwaiterWithTimeoutMock).toHaveBeenCalledWith(1);
    });
  });
});
