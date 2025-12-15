import { AccountId, Client } from '@hashgraph/sdk';
import { HederaClientService, HederaClientConfiguration, HederaNetwork } from '../src';

const network = (process.env.HEDERA_NETWORK as HederaNetwork) ?? 'testnet';
const operatorId = process.env.HEDERA_OPERATOR_ID ?? '';
const operatorKey = process.env.HEDERA_OPERATOR_KEY ?? '';

describe('HederaClientService', () => {
  let config: HederaClientConfiguration;
  let service: HederaClientService;

  beforeEach(() => {
    config = {
      networks: [
        {
          network,
          operatorId,
          operatorKey,
        },
      ],
    };
    service = new HederaClientService(config);
  });

  test('should throw an error if no networks are defined', () => {
    expect(() => new HederaClientService({ networks: [] })).toThrow('Networks must not be empty');
  });

  test('should throw an error if network names are not unique', () => {
    config.networks.push({
      network,
      operatorId,
      operatorKey,
    });
    expect(() => new HederaClientService(config)).toThrow('Network names must be unique');
  });

  test('should get client for a single network configuration', () => {
    const client = service.getClient();
    expect(client).toBeInstanceOf(Client);
    expect(client.operatorAccountId.toString()).toBe(operatorId);
  });

  test('should get client for multiple networks configuration by name', () => {
    const configWithMultipleNetworks: HederaClientConfiguration = {
      networks: [
        {
          network: 'mainnet',
          operatorId,
          operatorKey,
        },
        {
          network: 'testnet',
          operatorId,
          operatorKey,
        },
        {
          network: {
            name: 'custom-network',
            nodes: {
              'https://testnet-node00-00-grpc.hedera.com:443': new AccountId(3),
            },
          },
          operatorId,
          operatorKey,
        },
      ],
    };
    const serviceWithMultipleNetworks = new HederaClientService(configWithMultipleNetworks);
    const testnetClient = serviceWithMultipleNetworks.getClient('testnet');
    expect(testnetClient).toBeInstanceOf(Client);
    expect(testnetClient.operatorAccountId.toString()).toBe(operatorId);

    const customClient = serviceWithMultipleNetworks.getClient('custom-network');
    expect(customClient).toBeInstanceOf(Client);
    expect(customClient.operatorAccountId.toString()).toBe(operatorId);
  });

  test('should throw an error if unknown network is requested', () => {
    expect(() => service.getClient('unknownNetwork')).toThrow('Unknown Hedera network');
  });

  test('should execute operation with client and close the client afterwards', async () => {
    const mockOperation = jest.fn().mockResolvedValue(true);
    await service.withClient({ networkName: network }, (client) => {
      expect(client).toBeInstanceOf(Client);
      // eslint-disable-next-line @typescript-eslint/no-unsafe-return
      return mockOperation();
    });
    expect(mockOperation).toHaveBeenCalledTimes(1);
  });
});
