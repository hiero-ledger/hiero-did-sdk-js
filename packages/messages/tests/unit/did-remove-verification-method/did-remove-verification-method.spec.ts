import { PrivateKey } from '@hashgraph/sdk';
import { DIDRemoveVerificationMethodMessage } from '../../../src';
import { BASE64_PATTERN, VALID_DID, VALID_DID_TOPIC_ID } from '../helpers';

const randomMessage = async () => {
  const privateKey = await PrivateKey.generateED25519Async();

  return new DIDRemoveVerificationMethodMessage({
    did: VALID_DID,
    property: 'verificationMethod',
    id: '#key-1',
    timestamp: new Date(),
    signature: privateKey.sign(Buffer.from('a random message')),
  });
};

describe('DID Add verification method or verification relationship message', () => {
  describe('Serialization and deserialization', () => {
    let message: DIDRemoveVerificationMethodMessage;

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
        DIDRemoveVerificationMethodMessage.fromBytes(serialized);

      expect(deserialized.did).toBe(message.did);
      expect(deserialized.property).toBe(message.property);
      expect(deserialized.id).toBe(message.id);
      expect(deserialized.timestamp.toISOString()).toBe(
        message.timestamp.toISOString(),
      );
      expect(deserialized.signature).toEqual(Buffer.from(message.signature));
    });

    it('should serialize to the same bytes as before serialization', () => {
      const serialized = message.toBytes();
      const deserialized =
        DIDRemoveVerificationMethodMessage.fromBytes(serialized);

      expect(deserialized.toBytes()).toBe(serialized);
    });

    it('should serialize to the same bytes', () => {
      expect(message.toBytes()).toBe(message.toBytes());
    });
  });

  describe('Initialization', () => {
    it('should initialize with all properties', () => {
      const message = new DIDRemoveVerificationMethodMessage({
        did: VALID_DID,
        property: 'verificationMethod',
        id: '#key-1',
        timestamp: new Date(),
        signature: Buffer.from('a random message'),
      });

      expect(message).toBeDefined();
    });

    it('should initialize with only required properties', () => {
      const message = new DIDRemoveVerificationMethodMessage({
        did: VALID_DID,
        property: 'verificationMethod',
        id: '#key-1',
      });

      expect(message).toBeDefined();
    });

    it('should throw error when invalid DID is provided', () => {
      expect(() => {
        new DIDRemoveVerificationMethodMessage({
          did: 'invalid',
          property: 'verificationMethod',
          id: '#key-1',
        });
      }).toThrow('The DID must be a valid Hedera DID');
    });

    it('should throw error when invalid ID is provided', () => {
      expect(() => {
        new DIDRemoveVerificationMethodMessage({
          did: VALID_DID,
          property: 'verificationMethod',
          id: 'key-1',
        });
      }).toThrow('The ID must be a valid property ID');
    });
  });

  it('should have operation set to revoke', async () => {
    const message = await randomMessage();

    expect(message.operation).toBe('revoke');
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
      operation: 'revoke',
      did: message.did,
      event: expect.any(String),
    });
  });

  it('should return proper event data for verification method', () => {
    const message = new DIDRemoveVerificationMethodMessage({
      did: VALID_DID,
      property: 'verificationMethod',
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
      const message = new DIDRemoveVerificationMethodMessage({
        did: VALID_DID,
        property,
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
        },
      });
    },
  );
});
