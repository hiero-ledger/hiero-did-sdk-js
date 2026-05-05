import { Client, Hbar } from '@hiero-ledger/sdk';
import NodeClient from '@hiero-ledger/sdk/lib/client/NodeClient';
import { HederaClientConfiguration } from './hedera-client.configuration';

const MAX_TRANSACTION_FEE = 2;

export type NetworkName = {
  networkName?: string;
};

export class HederaClientService {
  private readonly configuration: HederaClientConfiguration;
  private readonly clients: Set<Client> = new Set();

  constructor(config: HederaClientConfiguration) {
    if (!config.networks.length) {
      throw new Error('Networks must not be empty');
    }
    const networkNames = config.networks.map((n) => (typeof n.network === 'string' ? n.network : n.network.name));
    if (new Set(networkNames).size !== networkNames.length) {
      throw new Error('Network names must be unique');
    }
    this.configuration = config;
  }

  public getClient(networkName?: string): Client {
    const networkConfig =
      !networkName && this.configuration.networks.length === 1
        ? this.configuration.networks[0]
        : this.configuration.networks.find(
            (n) => networkName === (typeof n.network === 'string' ? n.network : n.network.name)
          );

    if (!networkConfig) throw new Error('Unknown Hedera network');

    let client: NodeClient;
    if (typeof networkConfig.network === 'string') {
      client = Client.forName(networkConfig.network, { scheduleNetworkUpdate: false });
      client.setOperator(networkConfig.operatorId, networkConfig.operatorKey);
    } else {
      client = Client.fromConfig({
        network: networkConfig.network.nodes,
        mirrorNetwork: networkConfig.network.mirrorNodes,
        operator: {
          accountId: networkConfig.operatorId,
          privateKey: networkConfig.operatorKey,
        },
        scheduleNetworkUpdate: false,
      });
    }
    client.setDefaultMaxTransactionFee(new Hbar(MAX_TRANSACTION_FEE));
    this.clients.add(client);
    return client;
  }

  public close(): void {
    for (const client of this.clients) {
      client.close();
    }
    this.clients.clear();
  }

  public async withClient<T>(props: NetworkName, operation: (client: Client) => Promise<T>): Promise<T> {
    const client = this.getClient(props.networkName);
    try {
      return await operation(client);
    } finally {
      client.close();
      this.clients.delete(client);
    }
  }
}
