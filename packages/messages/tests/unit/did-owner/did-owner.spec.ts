import { PrivateKey, PublicKey } from '@hashgraph/sdk';
import { DIDOwnerMessage } from '../../../src';
import {
  BASE64_PATTERN,
  PUBLIC_KEY_BASE58,
  PUBLIC_KEY_ED25519,
  VALID_DID,
} from '../helpers';
import { Buffer } from 'buffer';

const randomMessage = async () => {
  const privateKey = await PrivateKey.generateED25519Async();

  return new DIDOwnerMessage({
    controller: VALID_DID,
    publicKey: privateKey.publicKey,
    topicId: '0.0.1',
    network: 'mainnet',
    timestamp: new Date(),
    signature: privateKey.sign(Buffer.from('a random message')),
  });
};

describe('DID Owner message', () => {
  describe('Initialization', () => {
    let publicKey: PublicKey;

    beforeAll(async () => {
      const privateKey = await PrivateKey.generateED25519Async();
      publicKey = privateKey.publicKey;
    });

    it('should initialize with only public key', () => {
      const message = new DIDOwnerMessage({
        publicKey,
      });

      expect(message).toBeDefined();
    });

    it('should initialize with all properties', () => {
      const message = new DIDOwnerMessage({
        controller: VALID_DID,
        publicKey,
        topicId: '0.0.1',
        network: 'mainnet',
        timestamp: new Date(),
        signature: Buffer.from('a random message'),
      });

      expect(message).toBeDefined();
    });

    it('should throw an error if controller is not a valid Hedera DID', () => {
      expect(() => {
        new DIDOwnerMessage({
          controller: 'invalid',
          publicKey,
        });
      }).toThrow('Controller is not a valid Hedera DID');
    });

    it('should generate a timestamp if not provided', () => {
      const message = new DIDOwnerMessage({
        publicKey,
      });

      expect(message.timestamp).toBeDefined();
      expect(message.timestamp).toBeInstanceOf(Date);
    });
  });

  describe('Serialization and deserialization', () => {
    let message: DIDOwnerMessage;

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
      const deserialized = DIDOwnerMessage.fromBytes(serialized);

      expect(deserialized._topicId).toBe(message._topicId);
      expect(deserialized.controller).toBe(message.controller);
      expect(deserialized.network).toBe(message.network);
      expect(deserialized.publicKey.toStringDer()).toBe(
        message.publicKey.toStringDer(),
      );
      expect(deserialized.timestamp.toISOString()).toBe(
        message.timestamp.toISOString(),
      );
      expect(deserialized.signature).toEqual(Buffer.from(message.signature));
    });

    it('should serialize to the same bytes as before serialization', () => {
      const serialized = message.toBytes();
      const deserialized = DIDOwnerMessage.fromBytes(serialized);

      expect(deserialized.toBytes()).toBe(serialized);
    });

    it('should serialize to the same bytes', () => {
      expect(message.toBytes()).toBe(message.toBytes());
    });
  });

  it('should have operation set to create', async () => {
    const message = await randomMessage();

    expect(message.operation).toBe('create');
  });

  it('should generate a valid DID', () => {
    const message = new DIDOwnerMessage({
      publicKey: PublicKey.fromStringED25519(PUBLIC_KEY_ED25519),
      network: 'mainnet',
      topicId: '0.0.1',
    });

    expect(message.did).toBeDefined();
    expect(message.did).toBe(`did:hedera:mainnet:${PUBLIC_KEY_BASE58}_0.0.1`);
  });

  it('should throw an error when topic id is missing when trying to access it', () => {
    const message = new DIDOwnerMessage({
      publicKey: PublicKey.fromStringED25519(PUBLIC_KEY_ED25519),
      network: 'mainnet',
    });

    expect(() => message.topicId).toThrow('Topic ID is missing');
  });

  it('should throw an error when network id is missing when trying to generate did', () => {
    const message = new DIDOwnerMessage({
      publicKey: PublicKey.fromStringED25519(PUBLIC_KEY_ED25519),
    });

    expect(() => message.did).toThrow('Network is missing');
  });

  it('should set controller to itself if not provided', () => {
    const message = new DIDOwnerMessage({
      publicKey: PublicKey.fromStringED25519(PUBLIC_KEY_ED25519),
      network: 'mainnet',
      topicId: '0.0.1',
    });

    expect(message.controllerDid).toBe(message.did);
  });

  it('should set controller to provided one', () => {
    const message = new DIDOwnerMessage({
      publicKey: PublicKey.fromStringED25519(PUBLIC_KEY_ED25519),
      controller: VALID_DID,
    });

    expect(message.controllerDid).toBe(VALID_DID);
  });

  it('should throw an error if controller is not a valid Hedera DID', async () => {
    const message = await randomMessage();
    expect(() => {
      message.setController('invalid');
    }).toThrow('Controller is not a valid Hedera DID');
  });

  it('should throw an error if topic ID is not a valid Hedera topic ID', async () => {
    const message = await randomMessage();
    expect(() => {
      message.setTopicId('invalid');
    }).toThrow('Topic ID is not a valid Hedera topic ID');
  });

  it('should update the topic ID', async () => {
    const message = await randomMessage();
    message.setTopicId('0.0.2');

    expect(message.topicId).toBe('0.0.2');
  });

  it('should update the network', async () => {
    const message = await randomMessage();
    message.setNetwork('testnet');

    expect(message.network).toBe('testnet');
  });

  it('should update the controller', async () => {
    const message = await randomMessage();
    message.setController(VALID_DID);

    expect(message.controller).toBe(VALID_DID);
  });

  it('should return true if topic ID is set', async () => {
    const message = await randomMessage();
    expect(message.hasTopicId).toBe(true);
  });

  it('should return false if topic ID is not set', () => {
    const message = new DIDOwnerMessage({
      publicKey: PublicKey.fromStringED25519(PUBLIC_KEY_ED25519),
      network: 'mainnet',
    });

    expect(message.hasTopicId).toBe(false);
  });

  it('should return proper message data', async () => {
    const message = await randomMessage();
    const messageData = message.message;

    expect(messageData).toBeDefined();
    expect(messageData).toMatchObject({
      timestamp: expect.any(String),
      operation: 'create',
      did: message.did,
      event: expect.any(String),
    });
  });

  it('should return proper event data', () => {
    const message = new DIDOwnerMessage({
      publicKey: PublicKey.fromStringED25519(PUBLIC_KEY_ED25519),
      network: 'mainnet',
      topicId: '0.0.1',
      signature: Buffer.from('a random message'),
    });
    const eventJson = Buffer.from(
      message.message['event'] as string,
      'base64',
    ).toString('utf8');
    const eventData = JSON.parse(eventJson);

    expect(eventData).toBeDefined();
    expect(eventData).toMatchObject({
      DIDOwner: {
        id: `did:hedera:mainnet:${PUBLIC_KEY_BASE58}_0.0.1`,
        type: 'Ed25519VerificationKey2020',
        controller: `did:hedera:mainnet:${PUBLIC_KEY_BASE58}_0.0.1`,
        publicKeyMultibase: expect.any(String),
      },
    });
  });
});
