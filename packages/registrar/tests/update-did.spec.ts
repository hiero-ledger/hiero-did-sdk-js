import { TopicMessageSubmitTransactionMock } from './mocks';

import { Client, PrivateKey } from '@hashgraph/sdk';
import { updateDID, UpdateDIDResult } from '../src';
import {
  VALID_DID_TOPIC_ID,
  TestPublisher,
  TestSigner,
  VALID_DID,
} from './helpers';
import * as UpdateSubOperations from '../src/update-did/sub-operations';

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
              property: 'verificationMethod',
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
              property: 'verificationMethod',
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
              property: 'verificationMethod',
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
              property: 'verificationMethod',
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
              property: 'verificationMethod',
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
            property: 'verificationMethod',
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
              property: 'verificationMethod',
            },
            {
              operation: 'add-verification-method',
              id: '#test',
              property: 'verificationMethod',
              publicKeyMultibase: 'test',
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
        'callOperation',
      );

      const firstOperation = {
        operation: 'add-verification-method',
        id: '#test',
        property: 'verificationMethod',
        publicKeyMultibase: 'test',
      } as const;

      const secondOperation = {
        operation: 'remove-verification-method',
        id: '#test',
        property: 'verificationMethod',
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

    it('should execute all update operations', async () => {
      const updateOperationsMock = jest.spyOn(
        UpdateSubOperations,
        'callOperation',
      );

      const result = await updateDID(
        {
          did: VALID_DID,
          updates: [
            {
              operation: 'remove-verification-method',
              id: '#test',
              property: 'verificationMethod',
            },
            {
              operation: 'remove-verification-method',
              id: '#test',
              property: 'verificationMethod',
            },
            {
              operation: 'remove-verification-method',
              id: '#test',
              property: 'verificationMethod',
            },
          ],
        },
        { signer, publisher },
      );

      expect(result).toBeDefined();
      expect(updateOperationsMock).toHaveBeenCalledTimes(3);
    });
  });
});
