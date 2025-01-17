import {
  Client,
  PrivateKey,
  Transaction,
  Status,
  LedgerId,
} from '@hashgraph/sdk';
import { Publisher } from '../src';
import { randomClient } from './helpers';

describe('Internal publisher class', () => {
  describe('initializing a publisher', () => {
    it('should be able to create a new instance', () => {
      const client = randomClient();
      const publisher = new Publisher(client);

      expect(publisher).toBeInstanceOf(Publisher);

      client.close();
    });

    it('should throw an error if the client is not provided', () => {
      expect(() => new Publisher(undefined as never)).toThrow(
        'Client is required',
      );
    });

    it('should throw an error if the client is not configured with a network', () => {
      const client = new Client();
      expect(() => new Publisher(client)).toThrow(
        'Client must be configured with a network',
      );

      client.close();
    });

    it('should throw an error if the client is not configured with an operator account', () => {
      const client = Client.forTestnet();
      expect(() => new Publisher(client)).toThrow(
        'Client must be configured with an operator account',
      );

      client.close();
    });
  });

  describe('publishing a transaction', () => {
    it('should execute transaction to network', async () => {
      const client = randomClient();
      const publisher = new Publisher(client);

      const transaction = new Transaction();
      const receiptMock = jest.fn();
      receiptMock.mockReturnValueOnce({
        status: Status.Success,
      });
      jest
        .spyOn(transaction, 'execute')
        .mockResolvedValueOnce({ getReceipt: receiptMock } as never);

      const receipt = await publisher.publish(transaction);

      expect(receiptMock).toHaveBeenCalledTimes(1);
      expect(receipt).toEqual({ status: Status.Success });

      client.close();
    });
  });

  it.each(['mainnet', 'testnet', 'previewnet', 'local-node'] as const)(
    'should return the correct network name for %s',
    (expectedNetwork) => {
      const client = randomClient(expectedNetwork);
      const publisher = new Publisher(client);
      expect(publisher.network()).toBe(expectedNetwork);

      client.close();
    },
  );

  it('should throw an error if the network is unknown', () => {
    const client = randomClient('testnet').setLedgerId(
      new LedgerId(new Uint8Array([10])),
    );
    const publisher = new Publisher(client);

    expect(() => publisher.network()).toThrow('Unknown network, ledger ID: 0a');

    client.close();
  });

  it('should return the public key of the publisher', () => {
    const privateKey = PrivateKey.generate();
    const client = Client.forTestnet().setOperator('0.0.12345', privateKey);
    const publisher = new Publisher(client);

    expect(publisher.publicKey().toStringDer()).toBe(
      privateKey.publicKey.toStringDer(),
    );

    client.close();
  });
});
