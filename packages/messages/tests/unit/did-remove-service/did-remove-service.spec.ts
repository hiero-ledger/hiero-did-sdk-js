import { PrivateKey } from '@hashgraph/sdk';
import { DIDRemoveServiceMessage } from '../../../src';
import { BASE64_PATTERN, VALID_DID, VALID_DID_TOPIC_ID } from '../helpers';

const randomMessage = async () => {
  const privateKey = await PrivateKey.generateED25519Async();

  return new DIDRemoveServiceMessage({
    did: VALID_DID,
    id: '#service-1',
    timestamp: new Date(),
    signature: privateKey.sign(Buffer.from('a random message')),
  });
};

describe('DID remove service message', () => {
  describe('Serialization and deserialization', () => {
    let message: DIDRemoveServiceMessage;

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
      const deserialized = DIDRemoveServiceMessage.fromBytes(serialized);

      expect(deserialized.did).toBe(message.did);
      expect(deserialized.id).toBe(message.id);
      expect(deserialized.timestamp.toISOString()).toBe(
        message.timestamp.toISOString(),
      );
      expect(deserialized.signature).toEqual(Buffer.from(message.signature));
    });

    it('should serialize to the same bytes as before serialization', () => {
      const serialized = message.toBytes();
      const deserialized = DIDRemoveServiceMessage.fromBytes(serialized);

      expect(deserialized.toBytes()).toBe(serialized);
    });

    it('should serialize to the same bytes', () => {
      expect(message.toBytes()).toBe(message.toBytes());
    });
  });

  describe('Initialization', () => {
    it('should initialize with all properties', () => {
      const message = new DIDRemoveServiceMessage({
        did: VALID_DID,
        id: '#service-1',
        timestamp: new Date(),
        signature: Buffer.from('a random message'),
      });

      expect(message).toBeDefined();
    });

    it('should initialize with only required properties', () => {
      const message = new DIDRemoveServiceMessage({
        did: VALID_DID,
        id: '#service-1',
      });

      expect(message).toBeDefined();
    });

    it('should throw error when invalid DID is provided', () => {
      expect(() => {
        new DIDRemoveServiceMessage({
          did: 'invalid',
          id: '#service-1',
        });
      }).toThrow('The DID must be a valid Hedera DID');
    });

    it('should throw error when invalid ID is provided', () => {
      expect(() => {
        new DIDRemoveServiceMessage({
          did: VALID_DID,
          id: 'service-1',
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

  it('should return proper event data for service', () => {
    const message = new DIDRemoveServiceMessage({
      did: VALID_DID,
      id: '#service-1',
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
      Service: {
        id: `${VALID_DID}#service-1`,
      },
    });
  });
});
