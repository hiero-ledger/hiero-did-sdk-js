import { DIDMessage, PublicKeyInDer, Verifier } from '../src';

export const VALID_DID_TOPIC_ID = '0.0.2';
export const VALID_DID = `did:hedera:mainnet:J98ruZqvaqtXE6chynQPnrjFu4qRAmofqbzVEsQXvNq4_${VALID_DID_TOPIC_ID}`;

export class TestDIDMessage extends DIDMessage {
  constructor(public readonly messageMock: jest.Mock = jest.fn()) {
    super();
  }

  get operation(): 'create' {
    return 'create';
  }

  get did(): string {
    return VALID_DID;
  }

  get message(): object {
    return this.messageMock() as never;
  }

  get topicId(): string {
    return VALID_DID_TOPIC_ID;
  }

  toBytes(): string {
    return 'test';
  }
}

export class TestVerifier implements Verifier {
  constructor(
    public readonly publicKeyMock: jest.Mock = jest.fn(),
    public readonly verifyMock: jest.Mock = jest.fn()
  ) {}

  publicKey(): PublicKeyInDer {
    return this.publicKeyMock() as never;
  }

  verify(message: Uint8Array, signature: Uint8Array): boolean {
    return this.verifyMock(message, signature) as never;
  }
}
