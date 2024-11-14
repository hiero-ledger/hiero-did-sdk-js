import { Client, PrivateKey } from '@hashgraph/sdk';
import { Providers } from '../../src/interfaces';
import { CreateDIDOptions } from '../../src';
import { TestPublisher, TestSigner } from '../helpers';

const client = Client.forTestnet();
client.close();

export const VALID_PROVIDERS: Providers[] = [
  {
    signer: new TestSigner(),
  },
  {
    client,
  },
  {
    clientOptions: {
      network: 'testnet',
      accountId: 'accountId',
      privateKey: 'derString',
    },
  },
  {
    publisher: new TestPublisher(),
  },
  {
    publisher: new TestPublisher(),
    signer: new TestSigner(),
  },
];

export const VALID_CREATE_DID_OPTIONS: CreateDIDOptions[] = [
  {
    controller: 'controller',
    topicId: 'topicId',
  },
  {
    topicId: 'topicId',
  },
  {
    controller: 'controller',
  },
  {
    privateKey: PrivateKey.generateED25519(),
  },
  {
    privateKey: 'derString',
  },
  {
    controller: 'controller',
    topicId: 'topicId',
    privateKey: 'derString',
  },
];
