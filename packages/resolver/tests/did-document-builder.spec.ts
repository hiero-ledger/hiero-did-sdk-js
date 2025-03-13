import { PrivateKey } from '@hashgraph/sdk';
import {
  KeysUtility,
  DID_ROOT_KEY_ID,
} from '@swiss-digital-assets-institute/core';
import { DidDocumentBuilder } from '../src/did-document-builder';
import {
  getAddServiceMessage,
  getAddVerificationMethodMessage,
  getDeactivateMessage,
  getDIDOwnerMessage,
  getRemoveServiceMessage,
  getRemoveVerificationMethodMessage,
  TestSigner,
  VALID_ANOTHER_DID,
  VALID_DID,
} from './helpers';
import { TopicDIDMessage } from '../src/interfaces/topic-did-message';

describe('DID Document Builder', () => {
  it('should load messages', () => {
    const messages = ['test', 'test2', 'test3'];
    const didDocumentBuilder = DidDocumentBuilder.from(messages);

    expect(didDocumentBuilder['messages']).toEqual(messages);
  });

  it('should set desired DID', () => {
    const didDocumentBuilder = DidDocumentBuilder.from([]).forDID(VALID_DID);
    expect(didDocumentBuilder['did']).toEqual(VALID_DID);
  });

  it('should throw an error if DID is invalid', () => {
    const didDocumentBuilder = DidDocumentBuilder.from([]);
    expect(() => didDocumentBuilder.forDID('invalid')).toThrow(
      'The DID must be a valid Hedera DID',
    );
  });

  it('should set verifier', () => {
    const signer = new TestSigner();
    const didDocumentBuilder = DidDocumentBuilder.from([]).withVerifier(signer);
    expect(didDocumentBuilder['verifier']).toEqual(signer);
  });

  describe('parsing message from topic', () => {
    it('should result with undefined when no messages', () => {
      const didDocumentBuilder = DidDocumentBuilder.from([]);
      expect(didDocumentBuilder['parseTopicMessage'](void 0)).toBeUndefined();
    });

    it('should result with undefined when the message is not a valid json string', () => {
      const didDocumentBuilder = DidDocumentBuilder.from([]);
      expect(
        didDocumentBuilder['parseTopicMessage']('{key: value}'),
      ).toBeUndefined();
    });

    it('should result with undefined when the message is not a valid DID message', () => {
      const didDocumentBuilder = DidDocumentBuilder.from([]);
      expect(
        didDocumentBuilder['parseTopicMessage'](
          JSON.stringify({ key: 'value' }),
        ),
      ).toBeUndefined();
    });

    it('should result with undefined when the message does not apply to the specified DID', () => {
      const didDocumentBuilder = DidDocumentBuilder.from([]).forDID(VALID_DID);
      expect(
        didDocumentBuilder['parseTopicMessage'](
          JSON.stringify({
            message: {
              timestamp: new Date().toISOString(),
              operation: 'create',
              did: VALID_ANOTHER_DID,
              event: 'ey...',
            },
            signature: '0x...',
          }),
        ),
      ).toBeUndefined();
    });

    it('should result with the parsed message when the valid message is provided', () => {
      const didDocumentBuilder = DidDocumentBuilder.from([]).forDID(VALID_DID);

      const message = {
        timestamp: new Date().toISOString(),
        operation: 'create',
        did: VALID_DID,
        event: 'ey...',
      };
      const signature = '0x...';

      expect(
        didDocumentBuilder['parseTopicMessage'](
          JSON.stringify({
            message,
            signature,
          }),
        ),
      ).toStrictEqual({
        message,
        signature,
      });
    });
  });

  describe('parsing event string', () => {
    it('should result with undefined when the event is not a valid json string', () => {
      const didDocumentBuilder = DidDocumentBuilder.from([]);
      expect(
        didDocumentBuilder['parseEventString'](
          Buffer.from('{key: value}').toString('base64'),
        ),
      ).toBeUndefined();
    });

    it('should result with undefined when the event is not a valid DID event', () => {
      const didDocumentBuilder = DidDocumentBuilder.from([]);

      const invalidEvent = {
        id: `${VALID_DID}`,
        type: 'Ed25519VerificationKey2018',
        controller: VALID_DID,
        publicKeyBase58: '6Mkq8X7Q7Jz3k3',
      };

      expect(
        didDocumentBuilder['parseEventString'](
          Buffer.from(JSON.stringify(invalidEvent)).toString('base64'),
        ),
      ).toBeUndefined();
    });

    it('should result with parsed event when the event is a valid DID event', () => {
      const didDocumentBuilder = DidDocumentBuilder.from([]);

      const validEvent = {
        Service: {
          id: `${VALID_DID}#service-1`,
          type: 'VerifiableCredentialService',
          serviceEndpoint: 'https://example.com/credentials',
        },
      };

      expect(
        didDocumentBuilder['parseEventString'](
          Buffer.from(JSON.stringify(validEvent)).toString('base64'),
        ),
      ).toStrictEqual(validEvent);
    });

    it('should set a verifier from a public key from a DID Owner event for verification (multibase format)', async () => {
      const didDocumentBuilder = DidDocumentBuilder.from([]);

      const privateKey = await PrivateKey.generateED25519Async();
      const publicKey = privateKey.publicKey;
      const publicKeyMultibase =
        KeysUtility.fromPublicKey(publicKey).toMultibase();

      const validEvent = {
        DIDOwner: {
          id: `${VALID_DID}`,
          type: 'Ed25519VerificationKey2020',
          controller: VALID_DID,
          publicKeyMultibase,
        },
      };

      didDocumentBuilder['parseEventString'](
        Buffer.from(JSON.stringify(validEvent)).toString('base64'),
      );

      expect(didDocumentBuilder['verifier']).toBeDefined();
      expect(didDocumentBuilder['verifier'].publicKey()).toStrictEqual(
        publicKey.toStringDer(),
      );
    });

    it('should set a verifier from a public key from a DID Owner event for verification (base58 format)', async () => {
      const didDocumentBuilder = DidDocumentBuilder.from([]);

      const privateKey = await PrivateKey.generateED25519Async();
      const publicKey = privateKey.publicKey;
      const publicKeyBase58 = KeysUtility.fromPublicKey(publicKey).toBase58();

      const validEvent = {
        DIDOwner: {
          id: `${VALID_DID}`,
          type: 'Ed25519VerificationKey2018',
          controller: VALID_DID,
          publicKeyBase58,
        },
      };

      didDocumentBuilder['parseEventString'](
        Buffer.from(JSON.stringify(validEvent)).toString('base64'),
      );

      expect(didDocumentBuilder['verifier']).toBeDefined();
      expect(didDocumentBuilder['verifier'].publicKey()).toStrictEqual(
        publicKey.toStringDer(),
      );
    });

    it('should not try to set a public key from an event different then DID Owner event', () => {
      const didDocumentBuilder = DidDocumentBuilder.from([]);

      const validEvent = {
        Service: {
          id: `${VALID_DID}#service-1`,
          type: 'VerifiableCredentialService',
          serviceEndpoint: 'https://example.com/credentials',
        },
      };

      didDocumentBuilder['parseEventString'](
        Buffer.from(JSON.stringify(validEvent)).toString('base64'),
      );
      expect(didDocumentBuilder['didPublicKey']).toBeUndefined();
    });
  });

  describe('verifying the message signature', () => {
    it('should throw an error if both verifier and public key are not set', async () => {
      const didDocumentBuilder = DidDocumentBuilder.from([]);
      await expect(
        didDocumentBuilder['verifySignature']({} as never, ''),
      ).rejects.toThrow(
        'Cannot verify signature without a public key or a verifier',
      );
    });

    it('should verify the signature using the verifier and return true for valid signature', async () => {
      const signer = new TestSigner();

      signer.verifyMock.mockReturnValue(true);

      const didDocumentBuilder = DidDocumentBuilder.from([]).withVerifier(
        signer,
      );

      const message: TopicDIDMessage = {
        timestamp: new Date().toISOString(),
        operation: 'create',
        did: VALID_DID,
        event: 'ey...',
      };
      const signature = 'valid-signature';

      expect(
        await didDocumentBuilder['verifySignature'](message, signature),
      ).toBe(true);

      expect(signer.verifyMock).toHaveBeenCalledTimes(1);
    });

    it('should verify the signature using the verifier and return false for invalid signature', async () => {
      const signer = new TestSigner();

      signer.verifyMock.mockReturnValue(false);

      const didDocumentBuilder = DidDocumentBuilder.from([]).withVerifier(
        signer,
      );

      const message: TopicDIDMessage = {
        timestamp: new Date().toISOString(),
        operation: 'create',
        did: VALID_DID,
        event: 'ey...',
      };
      const signature = 'invalid-signature';

      expect(
        await didDocumentBuilder['verifySignature'](message, signature),
      ).toBe(false);

      expect(signer.verifyMock).toHaveBeenCalledTimes(1);
    });
  });

  describe('handling events', () => {
    it('should add verification method from DID Owner event (base58)', async () => {
      const didDocumentBuilder = DidDocumentBuilder.from([]);

      const privateKey = await PrivateKey.generateED25519Async();
      const publicKey = privateKey.publicKey;
      const publicKeyBase58 = KeysUtility.fromPublicKey(publicKey).toBase58();

      const validEvent = {
        DIDOwner: {
          id: `${VALID_DID}`,
          type: 'Ed25519VerificationKey2018',
          controller: VALID_DID,
          publicKeyBase58,
        },
      };

      didDocumentBuilder['handleDIDOwner'](validEvent);

      expect(
        didDocumentBuilder['verificationMethod'].has(
          `${VALID_DID}${DID_ROOT_KEY_ID}`,
        ),
      ).toBe(true);
      expect(
        didDocumentBuilder['verificationMethod'].get(
          `${VALID_DID}${DID_ROOT_KEY_ID}`,
        ),
      ).toStrictEqual({
        id: `${VALID_DID}${DID_ROOT_KEY_ID}`,
        controller: VALID_DID,
        type: 'Ed25519VerificationKey2020',
        publicKeyMultibase:
          KeysUtility.fromBase58(publicKeyBase58).toMultibase(),
      });
    });

    it('should add verification method from DID Owner event (multibase)', async () => {
      const didDocumentBuilder = DidDocumentBuilder.from([]);

      const privateKey = await PrivateKey.generateED25519Async();
      const publicKey = privateKey.publicKey;
      const publicKeyMultibase =
        KeysUtility.fromPublicKey(publicKey).toMultibase();

      const validEvent = {
        DIDOwner: {
          id: `${VALID_DID}`,
          type: 'Ed25519VerificationKey2020',
          controller: VALID_DID,
          publicKeyMultibase,
        },
      };

      didDocumentBuilder['handleDIDOwner'](validEvent);

      expect(
        didDocumentBuilder['verificationMethod'].has(
          `${VALID_DID}${DID_ROOT_KEY_ID}`,
        ),
      ).toBe(true);
      expect(
        didDocumentBuilder['verificationMethod'].get(
          `${VALID_DID}${DID_ROOT_KEY_ID}`,
        ),
      ).toStrictEqual({
        id: `${VALID_DID}${DID_ROOT_KEY_ID}`,
        controller: VALID_DID,
        type: 'Ed25519VerificationKey2020',
        publicKeyMultibase,
      });
    });

    it('should add verification method from VerificationMethod event (base58)', async () => {
      const didDocumentBuilder = DidDocumentBuilder.from([]);

      const privateKey = await PrivateKey.generateED25519Async();
      const publicKey = privateKey.publicKey;
      const publicKeyBase58 = KeysUtility.fromPublicKey(publicKey).toBase58();

      const validEvent = {
        VerificationMethod: {
          id: `${VALID_DID}#test-key`,
          type: 'Ed25519VerificationKey2018',
          controller: VALID_DID,
          publicKeyBase58,
        },
      };

      didDocumentBuilder['handleAddVerificationMethod'](validEvent);

      expect(
        didDocumentBuilder['verificationMethod'].has(
          validEvent.VerificationMethod.id,
        ),
      ).toBe(true);
      expect(
        didDocumentBuilder['verificationMethod'].get(
          validEvent.VerificationMethod.id,
        ),
      ).toStrictEqual(validEvent.VerificationMethod);
    });

    it('should add verification method from VerificationMethod event (multibase)', async () => {
      const didDocumentBuilder = DidDocumentBuilder.from([]);

      const privateKey = await PrivateKey.generateED25519Async();
      const publicKey = privateKey.publicKey;
      const publicKeyMultibase =
        KeysUtility.fromPublicKey(publicKey).toMultibase();

      const validEvent = {
        VerificationMethod: {
          id: `${VALID_DID}#test-key`,
          type: 'Ed25519VerificationKey2018',
          controller: VALID_DID,
          publicKeyMultibase,
        },
      };

      didDocumentBuilder['handleAddVerificationMethod'](validEvent);

      expect(
        didDocumentBuilder['verificationMethod'].has(
          validEvent.VerificationMethod.id,
        ),
      ).toBe(true);
      expect(
        didDocumentBuilder['verificationMethod'].get(
          validEvent.VerificationMethod.id,
        ),
      ).toStrictEqual(validEvent.VerificationMethod);
    });

    it('should remove verification method from VerificationMethod event', async () => {
      const didDocumentBuilder = DidDocumentBuilder.from([]);

      const privateKey = await PrivateKey.generateED25519Async();
      const publicKey = privateKey.publicKey;
      const publicKeyMultibase =
        KeysUtility.fromPublicKey(publicKey).toMultibase();

      const validAddEvent = {
        VerificationMethod: {
          id: `${VALID_DID}#test-key`,
          type: 'Ed25519VerificationKey2018',
          controller: VALID_DID,
          publicKeyMultibase,
        },
      };

      didDocumentBuilder['handleAddVerificationMethod'](validAddEvent);

      const validRemoveEvent = {
        VerificationMethod: {
          id: validAddEvent.VerificationMethod.id,
        },
      };

      didDocumentBuilder['handleRemoveVerificationMethod'](validRemoveEvent);

      expect(
        didDocumentBuilder['verificationMethod'].has(
          validAddEvent.VerificationMethod.id,
        ),
      ).toBe(false);
    });

    it('should add service from Service event', () => {
      const didDocumentBuilder = DidDocumentBuilder.from([]);

      const validEvent = {
        Service: {
          id: `${VALID_DID}#service-1`,
          type: 'VerifiableCredentialService',
          serviceEndpoint: 'https://example.com/credentials',
        },
      };

      didDocumentBuilder['handleAddService'](validEvent);

      expect(didDocumentBuilder['service'].has(validEvent.Service.id)).toBe(
        true,
      );
      expect(
        didDocumentBuilder['service'].get(validEvent.Service.id),
      ).toStrictEqual(validEvent.Service);
    });

    it('should remove service from Service event', () => {
      const didDocumentBuilder = DidDocumentBuilder.from([]);

      const validAddEvent = {
        Service: {
          id: `${VALID_DID}#service-1`,
          type: 'VerifiableCredentialService',
          serviceEndpoint: 'https://example.com/credentials',
        },
      };

      didDocumentBuilder['handleAddService'](validAddEvent);

      const validRemoveEvent = {
        Service: {
          id: validAddEvent.Service.id,
        },
      };

      didDocumentBuilder['handleRemoveService'](validRemoveEvent);

      expect(didDocumentBuilder['service'].has(validAddEvent.Service.id)).toBe(
        false,
      );
    });

    it.each([
      'authentication',
      'assertionMethod',
      'keyAgreement',
      'capabilityInvocation',
      'capabilityDelegation',
    ] as const)(
      'should add %s from VerificationRelationship event (base58)',
      async (relationshipType) => {
        const didDocumentBuilder = DidDocumentBuilder.from([]);

        const privateKey = await PrivateKey.generateED25519Async();
        const publicKey = privateKey.publicKey;
        const publicKeyBase58 = KeysUtility.fromPublicKey(publicKey).toBase58();

        const expectedVerificationMethod = {
          id: `${VALID_DID}#test-key`,
          type: 'Ed25519VerificationKey2018',
          controller: VALID_DID,
          publicKeyBase58,
        };

        const validEvent = {
          VerificationRelationship: {
            relationshipType,
            ...expectedVerificationMethod,
          },
        };

        didDocumentBuilder['handleAddVerificationRelationship'](validEvent);

        expect(
          didDocumentBuilder['verificationRelationships'][relationshipType].has(
            validEvent.VerificationRelationship.id,
          ),
        ).toBe(true);

        expect(
          didDocumentBuilder['verificationRelationships'][relationshipType].get(
            validEvent.VerificationRelationship.id,
          ),
        ).toStrictEqual(expectedVerificationMethod);
      },
    );

    it.each([
      'authentication',
      'assertionMethod',
      'keyAgreement',
      'capabilityInvocation',
      'capabilityDelegation',
    ] as const)(
      'should add %s from VerificationRelationship event (multibase)',
      async (relationshipType) => {
        const didDocumentBuilder = DidDocumentBuilder.from([]);

        const privateKey = await PrivateKey.generateED25519Async();
        const publicKey = privateKey.publicKey;
        const publicKeyMultibase =
          KeysUtility.fromPublicKey(publicKey).toMultibase();

        const expectedVerificationMethod = {
          id: `${VALID_DID}#test-key`,
          type: 'Ed25519VerificationKey2018',
          controller: VALID_DID,
          publicKeyMultibase,
        };

        const validEvent = {
          VerificationRelationship: {
            relationshipType,
            ...expectedVerificationMethod,
          },
        };

        didDocumentBuilder['handleAddVerificationRelationship'](validEvent);

        expect(
          didDocumentBuilder['verificationRelationships'][relationshipType].has(
            validEvent.VerificationRelationship.id,
          ),
        ).toBe(true);

        expect(
          didDocumentBuilder['verificationRelationships'][relationshipType].get(
            validEvent.VerificationRelationship.id,
          ),
        ).toStrictEqual(expectedVerificationMethod);
      },
    );

    it.each([
      'authentication',
      'assertionMethod',
      'keyAgreement',
      'capabilityInvocation',
      'capabilityDelegation',
    ] as const)(
      'should remove %s from VerificationRelationship event (base58)',
      async (relationshipType) => {
        const didDocumentBuilder = DidDocumentBuilder.from([]);

        const privateKey = await PrivateKey.generateED25519Async();
        const publicKey = privateKey.publicKey;
        const publicKeyBase58 = KeysUtility.fromPublicKey(publicKey).toBase58();

        const validAddEvent = {
          VerificationRelationship: {
            id: `${VALID_DID}#test-key`,
            type: 'Ed25519VerificationKey2018',
            controller: VALID_DID,
            publicKeyBase58,
            relationshipType,
          },
        };

        didDocumentBuilder['handleAddVerificationRelationship'](validAddEvent);

        const validRemoveEvent = {
          VerificationRelationship: {
            id: validAddEvent.VerificationRelationship.id,
          },
        };

        didDocumentBuilder['handleRemoveVerificationRelationship'](
          validRemoveEvent,
        );

        expect(
          didDocumentBuilder['verificationRelationships'][relationshipType].has(
            validAddEvent.VerificationRelationship.id,
          ),
        ).toBe(false);
      },
    );

    it('should add only ID from VerificationRelationship event when verification method with the same ID exists', async () => {
      const didDocumentBuilder = DidDocumentBuilder.from([]);

      const privateKey = await PrivateKey.generateED25519Async();
      const publicKey = privateKey.publicKey;
      const publicKeyMultibase =
        KeysUtility.fromPublicKey(publicKey).toMultibase();

      const validVMEvent = {
        VerificationMethod: {
          id: `${VALID_DID}#test-key`,
          type: 'Ed25519VerificationKey2018',
          controller: VALID_DID,
          publicKeyMultibase,
        },
      };

      didDocumentBuilder['handleAddVerificationMethod'](validVMEvent);

      const validVRMEvent = {
        VerificationRelationship: {
          relationshipType: 'authentication',
          ...validVMEvent.VerificationMethod,
        },
      } as const;

      didDocumentBuilder['handleAddVerificationRelationship'](validVRMEvent);

      expect(
        didDocumentBuilder['verificationRelationships']['authentication'].has(
          validVRMEvent.VerificationRelationship.id,
        ),
      ).toBe(true);
      expect(
        didDocumentBuilder['verificationRelationships']['authentication'].get(
          validVRMEvent.VerificationRelationship.id,
        ),
      ).toBe(validVRMEvent.VerificationRelationship.id);
    });
  });

  describe('building the DID document', () => {
    it('should throw an error if the DID is not set', async () => {
      const didDocumentBuilder = DidDocumentBuilder.from([]);
      await expect(didDocumentBuilder.build()).rejects.toThrow(
        'DID is required to build a DID document',
      );
    });

    it('should throw not found error when no messages are provided', async () => {
      await expect(
        DidDocumentBuilder.from([]).forDID(VALID_DID).build(),
      ).rejects.toThrow('The DID document was not found');
    });

    it('should throw not found error if no valid DID messages are provided', async () => {
      await expect(
        DidDocumentBuilder.from(['invalid-message', 'invalid-message'])
          .forDID(VALID_DID)
          .build(),
      ).rejects.toThrow('The DID document was not found');
    });

    describe('given a DID Owner message', () => {
      let didOwnerMessage: Awaited<ReturnType<typeof getDIDOwnerMessage>>;

      beforeEach(async () => {
        didOwnerMessage = await getDIDOwnerMessage();
      });

      it('should return DID document with verification method from DID Owner event', async () => {
        const didDocumentBuilder = await DidDocumentBuilder.from([
          didOwnerMessage.message,
        ])
          .forDID(didOwnerMessage.did)
          .build();

        expect(didDocumentBuilder.toDidDocument()).toStrictEqual({
          id: didOwnerMessage.did,
          controller: didOwnerMessage.did,
          verificationMethod: [
            {
              id: `${didOwnerMessage.did}${DID_ROOT_KEY_ID}`,
              type: 'Ed25519VerificationKey2020',
              controller: didOwnerMessage.did,
              publicKeyMultibase: didOwnerMessage.publicKeyMultibase,
            },
          ],
        });
      });

      it('should throw an error if DID owner message was not fo requested DID', async () => {
        await expect(
          DidDocumentBuilder.from([didOwnerMessage.message])
            .forDID(VALID_DID)
            .build(),
        ).rejects.toThrow('The DID document was not found');
      });

      it('should return DID document with additional verification method', async () => {
        const verificationMethod = await getAddVerificationMethodMessage({
          privateKey: didOwnerMessage.privateKey,
          did: didOwnerMessage.did,
          property: 'verificationMethod',
          keyId: 'key-1',
        });

        const didDocumentBuilder = await DidDocumentBuilder.from([
          didOwnerMessage.message,
          verificationMethod.message,
        ])
          .forDID(didOwnerMessage.did)
          .build();

        expect(didDocumentBuilder.toDidDocument()).toStrictEqual({
          id: didOwnerMessage.did,
          controller: didOwnerMessage.did,
          verificationMethod: [
            {
              id: `${didOwnerMessage.did}${DID_ROOT_KEY_ID}`,
              type: 'Ed25519VerificationKey2020',
              controller: didOwnerMessage.did,
              publicKeyMultibase: didOwnerMessage.publicKeyMultibase,
            },
            {
              id: `${didOwnerMessage.did}#key-1`,
              type: 'Ed25519VerificationKey2020',
              controller: didOwnerMessage.did,
              publicKeyMultibase: verificationMethod.publicKeyMultibase,
            },
          ],
        });
      });

      it('should return DID document with additional service', async () => {
        const service = await getAddServiceMessage({
          privateKey: didOwnerMessage.privateKey,
          did: didOwnerMessage.did,
          serviceId: 'service-1',
        });

        const didDocumentBuilder = await DidDocumentBuilder.from([
          didOwnerMessage.message,
          service.message,
        ])
          .forDID(didOwnerMessage.did)
          .build();

        expect(didDocumentBuilder.toDidDocument()).toStrictEqual({
          id: didOwnerMessage.did,
          controller: didOwnerMessage.did,
          verificationMethod: [
            {
              id: `${didOwnerMessage.did}${DID_ROOT_KEY_ID}`,
              type: 'Ed25519VerificationKey2020',
              controller: didOwnerMessage.did,
              publicKeyMultibase: didOwnerMessage.publicKeyMultibase,
            },
          ],
          service: [
            {
              id: `${didOwnerMessage.did}#service-1`,
              type: 'VerifiableCredentialService',
              serviceEndpoint: 'https://example.com/credentials',
            },
          ],
        });
      });

      it('should have resolve the DID document with an alias of existing verification method', async () => {
        const verificationMethod = await getAddVerificationMethodMessage({
          privateKey: didOwnerMessage.privateKey,
          did: didOwnerMessage.did,
          property: 'authentication',
          keyId: 'did-root-key',
        });

        const didDocumentBuilder = await DidDocumentBuilder.from([
          didOwnerMessage.message,
          verificationMethod.message,
        ])
          .forDID(didOwnerMessage.did)
          .build();

        expect(didDocumentBuilder.toDidDocument()).toStrictEqual({
          id: didOwnerMessage.did,
          controller: didOwnerMessage.did,
          verificationMethod: [
            {
              id: `${didOwnerMessage.did}${DID_ROOT_KEY_ID}`,
              type: 'Ed25519VerificationKey2020',
              controller: didOwnerMessage.did,
              publicKeyMultibase: didOwnerMessage.publicKeyMultibase,
            },
          ],
          authentication: [`${didOwnerMessage.did}${DID_ROOT_KEY_ID}`],
        });
      });

      it('should stop process messages after deactivation message', async () => {
        const deactivateMessage = await getDeactivateMessage({
          did: didOwnerMessage.did,
          privateKey: didOwnerMessage.privateKey,
        });
        const verificationMethodMessage = await getAddVerificationMethodMessage(
          {
            privateKey: didOwnerMessage.privateKey,
            did: didOwnerMessage.did,
            property: 'verificationMethod',
            keyId: 'key-1',
          },
        );

        const didDocumentBuilder = await DidDocumentBuilder.from([
          didOwnerMessage.message,
          deactivateMessage.message,
          verificationMethodMessage.message,
        ])
          .forDID(didOwnerMessage.did)
          .build();

        expect(didDocumentBuilder.toDidDocument()).toStrictEqual({
          id: didOwnerMessage.did,
          controller: didOwnerMessage.did,
          verificationMethod: [],
        });
      });

      it('should not process deactivation message with invalid signature', async () => {
        const deactivateMessage = await getDeactivateMessage({
          did: didOwnerMessage.did,
          privateKey: didOwnerMessage.privateKey,
          signature: didOwnerMessage.privateKey.sign(new Uint8Array([1, 2])),
        });
        const verificationMethodMessage = await getAddVerificationMethodMessage(
          {
            privateKey: didOwnerMessage.privateKey,
            did: didOwnerMessage.did,
            property: 'verificationMethod',
            keyId: 'key-1',
          },
        );

        const didDocumentBuilder = await DidDocumentBuilder.from([
          didOwnerMessage.message,
          deactivateMessage.message,
          verificationMethodMessage.message,
        ])
          .forDID(didOwnerMessage.did)
          .build();

        expect(didDocumentBuilder.toDidDocument()).toStrictEqual({
          id: didOwnerMessage.did,
          controller: didOwnerMessage.did,
          verificationMethod: [
            {
              id: `${didOwnerMessage.did}${DID_ROOT_KEY_ID}`,
              type: 'Ed25519VerificationKey2020',
              controller: didOwnerMessage.did,
              publicKeyMultibase: didOwnerMessage.publicKeyMultibase,
            },
            {
              id: `${didOwnerMessage.did}#key-1`,
              type: 'Ed25519VerificationKey2020',
              controller: didOwnerMessage.did,
              publicKeyMultibase: verificationMethodMessage.publicKeyMultibase,
            },
          ],
        });
      });

      it('should not add message with invalid signature', async () => {
        const verificationMethodMessage = await getAddVerificationMethodMessage(
          {
            privateKey: didOwnerMessage.privateKey,
            did: didOwnerMessage.did,
            property: 'verificationMethod',
            keyId: 'key-1',
            signature: didOwnerMessage.privateKey.sign(new Uint8Array([1, 2])),
          },
        );

        const didDocumentBuilder = await DidDocumentBuilder.from([
          didOwnerMessage.message,
          verificationMethodMessage.message,
        ])
          .forDID(didOwnerMessage.did)
          .build();

        expect(
          didDocumentBuilder.toDidDocument().verificationMethod,
        ).toHaveLength(1);
      });

      it('should not process message with invalid event data', async () => {
        const invalidEvent = {
          Service: {
            id: 'service-1',
            type: 'VerifiableCredentialService',
            serviceEndpoint: 'https://example.com/credentials',
          },
        };

        const messageData: TopicDIDMessage = {
          timestamp: new Date().toISOString(),
          operation: 'update',
          did: didOwnerMessage.did,
          event: Buffer.from(JSON.stringify(invalidEvent)).toString('base64'),
        };
        const signature = didOwnerMessage.privateKey.sign(
          Buffer.from(JSON.stringify(messageData)),
        );

        const validMessage = {
          message: messageData,
          signature: Buffer.from(signature).toString('base64'),
        };

        const didDocumentBuilder = await DidDocumentBuilder.from([
          didOwnerMessage.message,
          JSON.stringify(validMessage),
        ])
          .forDID(didOwnerMessage.did)
          .build();

        expect(didDocumentBuilder.toDidDocument()).toStrictEqual({
          id: didOwnerMessage.did,
          controller: didOwnerMessage.did,
          verificationMethod: [
            {
              id: `${didOwnerMessage.did}${DID_ROOT_KEY_ID}`,
              type: 'Ed25519VerificationKey2020',
              controller: didOwnerMessage.did,
              publicKeyMultibase: didOwnerMessage.publicKeyMultibase,
            },
          ],
        });
      });

      it('should not be able to remove did root key', async () => {
        const removeVerificationMethod =
          await getRemoveVerificationMethodMessage({
            keyId: DID_ROOT_KEY_ID.slice(1),
            did: didOwnerMessage.did,
            privateKey: didOwnerMessage.privateKey,
            property: 'verificationMethod',
          });

        const didDocumentBuilder = await DidDocumentBuilder.from([
          didOwnerMessage.message,
          removeVerificationMethod.message,
        ])
          .forDID(didOwnerMessage.did)
          .build();

        expect(didDocumentBuilder.toDidDocument()).toStrictEqual({
          id: didOwnerMessage.did,
          controller: didOwnerMessage.did,
          verificationMethod: [
            {
              id: `${didOwnerMessage.did}${DID_ROOT_KEY_ID}`,
              type: 'Ed25519VerificationKey2020',
              controller: didOwnerMessage.did,
              publicKeyMultibase: didOwnerMessage.publicKeyMultibase,
            },
          ],
        });
      });
    });
  });

  describe('resolving the DID document to specific type', () => {
    let builder: DidDocumentBuilder;
    let expectedDIDDocument: object;
    let messages: string[];
    let did: string;
    let privateKey: PrivateKey;

    beforeEach(async () => {
      const didOwnerMessage = await getDIDOwnerMessage();

      const [
        verificationMethodToRemove,
        authenticationMethodToRemove,
        assertionMethodToRemove,
        keyAgreementMethodToRemove,
        capabilityInvocationMethodToRemove,
        capabilityDelegationMethodToRemove,
        serviceToRemove,
        removeVerificationMethod,
        removeAuthenticationMethod,
        removeAssertionMethod,
        removeKeyAgreementMethod,
        removeCapabilityInvocationMethod,
        removeCapabilityDelegationMethod,
        removeService,
        verificationMethod,
        authenticationMethod,
        assertionMethod,
        keyAgreementMethod,
        capabilityInvocationMethod,
        capabilityDelegationMethod,
        service,
      ] = await Promise.all([
        getAddVerificationMethodMessage({
          privateKey: didOwnerMessage.privateKey,
          property: 'verificationMethod',
          did: didOwnerMessage.did,
          keyId: 'to-remove-1',
        }),
        getAddVerificationMethodMessage({
          privateKey: didOwnerMessage.privateKey,
          property: 'authentication',
          did: didOwnerMessage.did,
          keyId: 'to-remove-2',
        }),
        getAddVerificationMethodMessage({
          privateKey: didOwnerMessage.privateKey,
          property: 'assertionMethod',
          did: didOwnerMessage.did,
          keyId: 'to-remove-3',
        }),
        getAddVerificationMethodMessage({
          privateKey: didOwnerMessage.privateKey,
          property: 'keyAgreement',
          did: didOwnerMessage.did,
          keyId: 'to-remove-4',
        }),
        getAddVerificationMethodMessage({
          privateKey: didOwnerMessage.privateKey,
          property: 'capabilityInvocation',
          did: didOwnerMessage.did,
          keyId: 'to-remove-5',
        }),
        getAddVerificationMethodMessage({
          privateKey: didOwnerMessage.privateKey,
          property: 'capabilityDelegation',
          did: didOwnerMessage.did,
          keyId: 'to-remove-6',
        }),
        getAddServiceMessage({
          privateKey: didOwnerMessage.privateKey,
          did: didOwnerMessage.did,
          serviceId: 'to-remove-7',
        }),
        getRemoveVerificationMethodMessage({
          keyId: 'to-remove-1',
          did: didOwnerMessage.did,
          property: 'verificationMethod',
          privateKey: didOwnerMessage.privateKey,
        }),
        getRemoveVerificationMethodMessage({
          keyId: 'to-remove-2',
          did: didOwnerMessage.did,
          property: 'authentication',
          privateKey: didOwnerMessage.privateKey,
        }),
        getRemoveVerificationMethodMessage({
          keyId: 'to-remove-3',
          did: didOwnerMessage.did,
          property: 'assertionMethod',
          privateKey: didOwnerMessage.privateKey,
        }),
        getRemoveVerificationMethodMessage({
          keyId: 'to-remove-4',
          did: didOwnerMessage.did,
          property: 'keyAgreement',
          privateKey: didOwnerMessage.privateKey,
        }),
        getRemoveVerificationMethodMessage({
          keyId: 'to-remove-5',
          did: didOwnerMessage.did,
          property: 'capabilityInvocation',
          privateKey: didOwnerMessage.privateKey,
        }),
        getRemoveVerificationMethodMessage({
          keyId: 'to-remove-6',
          did: didOwnerMessage.did,
          property: 'capabilityDelegation',
          privateKey: didOwnerMessage.privateKey,
        }),
        getRemoveServiceMessage({
          serviceId: 'to-remove-7',
          did: didOwnerMessage.did,
          privateKey: didOwnerMessage.privateKey,
        }),
        getAddVerificationMethodMessage({
          privateKey: didOwnerMessage.privateKey,
          property: 'verificationMethod',
          did: didOwnerMessage.did,
          keyId: 'key-1',
        }),
        getAddVerificationMethodMessage({
          privateKey: didOwnerMessage.privateKey,
          property: 'authentication',
          did: didOwnerMessage.did,
          keyId: 'key-2',
        }),
        getAddVerificationMethodMessage({
          privateKey: didOwnerMessage.privateKey,
          property: 'assertionMethod',
          did: didOwnerMessage.did,
          keyId: 'key-3',
        }),
        getAddVerificationMethodMessage({
          privateKey: didOwnerMessage.privateKey,
          property: 'keyAgreement',
          did: didOwnerMessage.did,
          keyId: 'key-4',
        }),
        getAddVerificationMethodMessage({
          privateKey: didOwnerMessage.privateKey,
          property: 'capabilityInvocation',
          did: didOwnerMessage.did,
          keyId: 'key-5',
        }),
        getAddVerificationMethodMessage({
          privateKey: didOwnerMessage.privateKey,
          property: 'capabilityDelegation',
          did: didOwnerMessage.did,
          keyId: 'key-6',
        }),
        getAddServiceMessage({
          privateKey: didOwnerMessage.privateKey,
          did: didOwnerMessage.did,
          serviceId: 'service-1',
        }),
      ]);

      messages = [
        didOwnerMessage.message,
        service.message,
        capabilityDelegationMethodToRemove.message,
        verificationMethodToRemove.message,
        verificationMethod.message,
        authenticationMethodToRemove.message,
        authenticationMethod.message,
        assertionMethod.message,
        serviceToRemove.message,
        keyAgreementMethod.message,
        capabilityInvocationMethod.message,
        capabilityDelegationMethod.message,
        assertionMethodToRemove.message,
        removeAssertionMethod.message,
        removeCapabilityDelegationMethod.message,
        keyAgreementMethodToRemove.message,
        removeKeyAgreementMethod.message,
        removeService.message,
        capabilityInvocationMethodToRemove.message,
        removeCapabilityInvocationMethod.message,
        removeVerificationMethod.message,
        removeAuthenticationMethod.message,
      ];

      did = didOwnerMessage.did;
      privateKey = didOwnerMessage.privateKey;
      expectedDIDDocument = {
        id: did,
        controller: did,
        verificationMethod: [
          {
            id: `${did}${DID_ROOT_KEY_ID}`,
            type: 'Ed25519VerificationKey2020',
            controller: did,
            publicKeyMultibase: expect.any(String),
          },
          {
            id: `${did}#key-1`,
            type: 'Ed25519VerificationKey2020',
            controller: did,
            publicKeyMultibase: expect.any(String),
          },
        ],
        authentication: [
          {
            id: `${did}#key-2`,
            type: 'Ed25519VerificationKey2020',
            controller: did,
            publicKeyMultibase: expect.any(String),
          },
        ],
        assertionMethod: [
          {
            id: `${did}#key-3`,
            type: 'Ed25519VerificationKey2020',
            controller: did,
            publicKeyMultibase: expect.any(String),
          },
        ],
        keyAgreement: [
          {
            id: `${did}#key-4`,
            type: 'Ed25519VerificationKey2020',
            controller: did,
            publicKeyMultibase: expect.any(String),
          },
        ],
        capabilityInvocation: [
          {
            id: `${did}#key-5`,
            type: 'Ed25519VerificationKey2020',
            controller: did,
            publicKeyMultibase: expect.any(String),
          },
        ],
        capabilityDelegation: [
          {
            id: `${did}#key-6`,
            type: 'Ed25519VerificationKey2020',
            controller: did,
            publicKeyMultibase: expect.any(String),
          },
        ],
        service: [
          {
            id: `${did}#service-1`,
            type: 'VerifiableCredentialService',
            serviceEndpoint: 'https://example.com/credentials',
          },
        ],
      };

      builder = await DidDocumentBuilder.from(messages)
        .forDID(didOwnerMessage.did)
        .build();
    });

    it('should resolve simple did document', () => {
      const didDocument = builder.toDidDocument();

      expect(didDocument).toStrictEqual(expectedDIDDocument);
    });

    it('should resolve json-ld did document', () => {
      const didDocument = builder.toJsonLdDIDDocument();

      expect(didDocument).toStrictEqual({
        '@context': expect.arrayContaining([expect.any(String)]),
        ...expectedDIDDocument,
      });
    });

    it('should resolve did document with resolution data', () => {
      const didDocument = builder.toResolution();

      expect(didDocument).toStrictEqual({
        didDocumentMetadata: {
          created: expect.any(String),
          updated: expect.any(String),
          deactivated: false,
        },
        didResolutionMetadata: {
          contentType:
            'application/ld+json;profile="https://w3id.org/did-resolution"',
        },
        didDocument: {
          '@context': expect.arrayContaining([expect.any(String)]),
          ...expectedDIDDocument,
        },
      });
    });

    describe('resolving when DID document is deactivated', () => {
      beforeEach(async () => {
        const deactivateMessage = await getDeactivateMessage({
          did,
          privateKey,
        });

        builder = await DidDocumentBuilder.from([
          ...messages,
          deactivateMessage.message,
        ])
          .forDID(did)
          .build();
      });

      it('should resolve deactivated DID document', () => {
        const didDocument = builder.toResolution();

        expect(didDocument).toStrictEqual({
          didDocumentMetadata: {
            created: expect.any(String),
            updated: expect.any(String),
            deactivated: true,
          },
          didResolutionMetadata: {
            contentType:
              'application/ld+json;profile="https://w3id.org/did-resolution"',
          },
          didDocument: {
            '@context': expect.arrayContaining([expect.any(String)]),
            id: did,
            controller: did,
            verificationMethod: [],
          },
        });
      });
    });
  });

  afterEach(() => {
    jest.clearAllMocks();
  });
});
