import { Network, PublicKeyInDer, Publisher, Signer } from '@hiero-did-sdk/core';
import { Client, PrivateKey, PublicKey, Transaction, TransactionReceipt } from '@hashgraph/sdk';

export class TestSigner extends Signer {
  constructor(
    public readonly signMock: jest.Mock = jest.fn(),
    public readonly publicKeyMock: jest.Mock = jest.fn(),
    public readonly verifyMock: jest.Mock = jest.fn()
  ) {
    super();
  }

  sign(data: Uint8Array): Promise<Uint8Array> {
    return this.signMock(data) as never;
  }

  publicKey(): Promise<PublicKeyInDer> {
    return this.publicKeyMock() as never;
  }

  verify(message: Uint8Array, signature: Uint8Array): Promise<boolean> {
    return this.verifyMock(message, signature) as never;
  }
}

export class TestPublisher implements Publisher {
  constructor(
    public readonly networkMock: jest.Mock = jest.fn(),
    public readonly publicKeyMock: jest.Mock = jest.fn(),
    public readonly publishMock: jest.Mock = jest.fn()
  ) {}

  network(): Network {
    return this.networkMock() as never;
  }

  publicKey(): PublicKey {
    return this.publicKeyMock() as never;
  }

  publish(transaction: Transaction): Promise<TransactionReceipt> | TransactionReceipt {
    return this.publishMock(transaction) as never;
  }
}

export function randomClient(network: Network = 'testnet'): Client {
  return Client.forName(network).setOperator('0.0.12345', PrivateKey.generate());
}

export const CREATED_TOPIC_ID = '0.0.1';
export const OPERATOR_PUBLIC_KEY = 'test-operator-public-key';
export const VALID_DID_TOPIC_ID = '0.0.2';
export const PUBLIC_KEY_BASE58 = 'J98ruZqvaqtXE6chynQPnrjFu4qRAmofqbzVEsQXvNq4';
export const PUBLIC_KEY_MULTIBASE = `z${PUBLIC_KEY_BASE58}`;
export const VALID_DID = `did:hedera:mainnet:${PUBLIC_KEY_BASE58}_${VALID_DID_TOPIC_ID}`;
