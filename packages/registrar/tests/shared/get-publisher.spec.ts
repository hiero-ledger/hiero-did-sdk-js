import { Publisher } from '@swiss-digital-assets-institute/publisher-internal';
import { PrivateKey } from '@hashgraph/sdk';
import { getPublisher } from '../../src/shared/get-publisher';
import { randomClient, TestPublisher, TestSigner } from '../helpers';

describe('Get publisher from providers', () => {
  it('should return the provided publisher from the providers', () => {
    const publisher = new TestPublisher();
    expect(getPublisher({ publisher })).toBe(publisher);
  });

  it('should create a new internal publisher from the client', () => {
    const client = randomClient('testnet');

    const publisher = getPublisher({ client });
    expect(publisher).toBeDefined();
    expect(publisher).toBeInstanceOf(Publisher);

    expect(publisher.network()).toBe('testnet');
    expect(publisher.publicKey()).toStrictEqual(client.operatorPublicKey);

    client.close();
  });

  it('should create a new internal publisher from the client options', async () => {
    const privateKey = await PrivateKey.generateED25519Async();
    const publisher = getPublisher({
      clientOptions: {
        network: 'testnet',
        accountId: '0.0.0',
        privateKey,
      },
    });

    expect(publisher).toBeDefined();
    expect(publisher).toBeInstanceOf(Publisher);

    expect(publisher.network()).toBe('testnet');
    expect(publisher.publicKey()).toStrictEqual(privateKey.publicKey);

    if (publisher instanceof Publisher) {
      publisher.client.close();
    }
  });

  it('should throw an error if client options, client and publisher are not provided', () => {
    expect(() =>
      getPublisher({
        signer: new TestSigner(),
      }),
    ).toThrow('Providers must contain client options or client or publisher');
  });
});
