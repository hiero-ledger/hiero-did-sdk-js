import { PrivateKey } from '@hashgraph/sdk';
import { DIDAddVerificationMethodMessage } from '../../../src';
import {
  BASE64_PATTERN,
  PUBLIC_KEY_MULTIBASE,
  VALID_DID,
  VALID_DID_TOPIC_ID,
} from '../helpers';

const randomMessage = async () => {
  const privateKey = await PrivateKey.generateED25519Async();

  return new DIDAddVerificationMethodMessage({
    did: VALID_DID,
    controller: VALID_DID,
    property: 'verificationMethod',
    publicKeyMultibase: PUBLIC_KEY_MULTIBASE,
    id: '#key-1',
    timestamp: new Date(),
    signature: privateKey.sign(Buffer.from('a random message')),
  });
};

describe('DID Add verification method or verification relationship message', () => {
  describe('Serialization and deserialization', () => {
    let message: DIDAddVerificationMethodMessage;

    beforeAll(async () => {
      message = await randomMessage();
    });

    it('should serialize to base64 string', () => {
      const serialized = message.toBytes();

      expect(serialized).toBeDefined();
      expect(serialized).not.toBe('');
      expect(BASE64_PATTERN.test(serialized)).toBe(true);
    });

    it('should deserialize from base64 string', () => {
      const serialized = message.toBytes();
      const deserialized =
        DIDAddVerificationMethodMessage.fromBytes(serialized);

      expect(deserialized.did).toBe(message.did);
      expect(deserialized.controller).toBe(message.controller);
      expect(deserialized.property).toBe(message.property);
      expect(deserialized.publicKeyMultibase).toBe(message.publicKeyMultibase);
      expect(deserialized.id).toBe(message.id);
      expect(deserialized.timestamp.toISOString()).toBe(
        message.timestamp.toISOString(),
      );
      expect(deserialized.signature).toEqual(Buffer.from(message.signature));
    });

    it('should serialize to the same bytes as before serialization', () => {
      const serialized = message.toBytes();
      const deserialized =
        DIDAddVerificationMethodMessage.fromBytes(serialized);

      expect(deserialized.toBytes()).toBe(serialized);
    });

    it('should serialize to the same bytes', () => {
      expect(message.toBytes()).toBe(message.toBytes());
    });
  });

  describe('Initialization', () => {
    it('should initialize with all properties', () => {
      const message = new DIDAddVerificationMethodMessage({
        did: VALID_DID,
        controller: VALID_DID,
        property: 'verificationMethod',
        publicKeyMultibase: PUBLIC_KEY_MULTIBASE,
        id: '#key-1',
        timestamp: new Date(),
        signature: Buffer.from('a random message'),
      });

      expect(message).toBeDefined();
    });

    it('should initialize with only required properties', () => {
      const message = new DIDAddVerificationMethodMessage({
        did: VALID_DID,
        controller: VALID_DID,
        property: 'verificationMethod',
        publicKeyMultibase: PUBLIC_KEY_MULTIBASE,
        id: '#key-1',
      });

      expect(message).toBeDefined();
    });

    it('should throw error when invalid DID is provided', () => {
      expect(() => {
        new DIDAddVerificationMethodMessage({
          did: 'invalid',
          controller: VALID_DID,
          property: 'verificationMethod',
          publicKeyMultibase: PUBLIC_KEY_MULTIBASE,
          id: '#key-1',
        });
      }).toThrow('The DID must be a valid Hedera DID.');
    });

    it('should throw error when invalid key is provided', () => {
      expect(() => {
        new DIDAddVerificationMethodMessage({
          did: VALID_DID,
          controller: VALID_DID,
          property: 'verificationMethod',
          publicKeyMultibase: 'invalid',
          id: '#key-1',
        });
      }).toThrow('Invalid length for the public key.');
    });

    it('should throw error when invalid controller is provided', () => {
      expect(() => {
        new DIDAddVerificationMethodMessage({
          did: VALID_DID,
          controller: 'invalid',
          property: 'verificationMethod',
          publicKeyMultibase: PUBLIC_KEY_MULTIBASE,
          id: '#key-1',
        });
      }).toThrow('The controller must be a valid Hedera DID.');
    });

    it('should throw error when invalid ID is provided', () => {
      expect(() => {
        new DIDAddVerificationMethodMessage({
          did: VALID_DID,
          controller: VALID_DID,
          property: 'verificationMethod',
          publicKeyMultibase: PUBLIC_KEY_MULTIBASE,
          id: 'key-1',
        });
      }).toThrow('The ID must be a valid property ID.');
    });
  });

  it('should have operation set to update', async () => {
    const message = await randomMessage();

    expect(message.operation).toBe('update');
  });

  it('should return proper topic ID', async () => {
    const message = await randomMessage();

    expect(message.topicId).toBe(VALID_DID_TOPIC_ID);
  });

  it('should return proper message data', async () => {
    const message = await randomMessage();
    const messageData = message.message;

    expect(messageData).toBeDefined();
    expect(messageData).toMatchObject({
      timestamp: expect.any(String),
      operation: 'update',
      did: message.did,
      event: expect.any(String),
    });
  });

  it('should return proper event data for verification method', () => {
    const message = new DIDAddVerificationMethodMessage({
      did: VALID_DID,
      controller: VALID_DID,
      property: 'verificationMethod',
      publicKeyMultibase: PUBLIC_KEY_MULTIBASE,
      id: '#key-1',
      timestamp: new Date(),
      signature: Buffer.from('a random message'),
    });
    const eventJson = Buffer.from(
      message.message['event'] as string,
      'base64',
    ).toString('utf8');
    const eventData = JSON.parse(eventJson);

    expect(eventData).toBeDefined();
    expect(eventData).toMatchObject({
      VerificationMethod: {
        id: `${VALID_DID}#key-1`,
        type: 'Ed25519VerificationKey2020',
        controller: VALID_DID,
        publicKeyMultibase: PUBLIC_KEY_MULTIBASE,
      },
    });
  });

  it.each([
    'authentication',
    'assertionMethod',
    'keyAgreement',
    'capabilityInvocation',
    'capabilityDelegation',
  ] as const)(
    'should return proper event data for verification relationship [%s]',
    (property) => {
      const message = new DIDAddVerificationMethodMessage({
        did: VALID_DID,
        controller: VALID_DID,
        property,
        publicKeyMultibase: PUBLIC_KEY_MULTIBASE,
        id: '#key-1',
        timestamp: new Date(),
        signature: Buffer.from('a random message'),
      });
      const eventJson = Buffer.from(
        message.message['event'] as string,
        'base64',
      ).toString('utf8');
      const eventData = JSON.parse(eventJson);

      expect(eventData).toBeDefined();
      expect(eventData).toMatchObject({
        VerificationRelationship: {
          id: `${VALID_DID}#key-1`,
          type: 'Ed25519VerificationKey2020',
          controller: VALID_DID,
          publicKeyMultibase: PUBLIC_KEY_MULTIBASE,
          relationshipType: property,
        },
      });
    },
  );
});
