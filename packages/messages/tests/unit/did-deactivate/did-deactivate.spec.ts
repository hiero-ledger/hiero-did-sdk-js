import { PrivateKey } from '@hashgraph/sdk';
import { DIDDeactivateMessage } from '../../../src';
import { BASE64_PATTERN, VALID_DID, VALID_DID_TOPIC_ID } from '../helpers';

const randomMessage = async () => {
  const privateKey = await PrivateKey.generateED25519Async();

  return new DIDDeactivateMessage({
    did: VALID_DID,
    timestamp: new Date(),
    signature: privateKey.sign(Buffer.from('a random message')),
  });
};

describe('DID Deactivate message', () => {
  describe('Serialization and deserialization', () => {
    let message: DIDDeactivateMessage;

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
      const deserialized = DIDDeactivateMessage.fromBytes(serialized);

      expect(deserialized.did).toBe(message.did);
      expect(deserialized.timestamp.toISOString()).toBe(
        message.timestamp.toISOString(),
      );
      expect(deserialized.signature).toEqual(Buffer.from(message.signature));
    });

    it('should serialize to the same bytes as before serialization', () => {
      const serialized = message.toBytes();
      const deserialized = DIDDeactivateMessage.fromBytes(serialized);

      expect(deserialized.toBytes()).toBe(serialized);
    });

    it('should serialize to the same bytes', () => {
      expect(message.toBytes()).toBe(message.toBytes());
    });
  });

  describe('Initialization', () => {
    it('should initialize with all properties', () => {
      const message = new DIDDeactivateMessage({
        did: VALID_DID,
        timestamp: new Date(),
        signature: Buffer.from('a random message'),
      });

      expect(message).toBeDefined();
    });

    it('should initialize with only required properties', () => {
      const message = new DIDDeactivateMessage({
        did: VALID_DID,
        timestamp: new Date(),
      });

      expect(message).toBeDefined();
    });

    it('should throw an error if DID is not a valid Hedera DID', () => {
      expect(() => {
        new DIDDeactivateMessage({
          did: 'invalid',
          signature: Buffer.from('a random message'),
        });
      }).toThrow('The DID must be a valid Hedera DID');
    });
  });

  it('should have operation set to delete', async () => {
    const message = await randomMessage();

    expect(message.operation).toBe('delete');
  });

  it('should generate a timestamp if not provided', () => {
    const message = new DIDDeactivateMessage({
      did: VALID_DID,
      signature: Buffer.from('a random message'),
    });

    expect(message.timestamp).toBeDefined();
    expect(message.timestamp).toBeInstanceOf(Date);
  });

  it('should return topic id', async () => {
    const message = await randomMessage();
    expect(message.topicId).toBe(VALID_DID_TOPIC_ID);
  });

  it('should return proper message data', async () => {
    const message = await randomMessage();
    const messageData = message.message;

    expect(messageData).toBeDefined();
    expect(messageData).toMatchObject({
      timestamp: expect.any(String),
      operation: 'delete',
      did: message.did,
      event: null,
    });
  });
});
