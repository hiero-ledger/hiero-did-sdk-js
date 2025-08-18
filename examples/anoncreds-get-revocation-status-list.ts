/*
 * This example demonstrates how to get a revocation status list
 * by revocation registry ID and timestamp using `getRevocationStatusList`.
 */
import { HederaAnoncredsRegistry } from '@hiero-did-sdk/anoncreds';
import { HederaClientConfiguration } from '@hiero-did-sdk/client';

const operatorId = process.env.HEDERA_TESTNET_OPERATOR_ID;
const operatorKey = process.env.HEDERA_TESTNET_OPERATOR_KEY;

const config: HederaClientConfiguration = {
  networks: [
    {
      network: 'testnet',
      operatorId,
      operatorKey,
    },
  ],
};

// Specify the existing revocationRegistryId on the testnet here
const revocationRegistryId =
  'did:hedera:testnet:zFAeKMsqnNc2bwEsC8oqENBvGqjpGu9tpUi3VWaFEBXBo_0.0.5896419/anoncreds/v0/REV_REG/0.0.6557949';
const timestamp = Date.now();

async function main() {
  const registry = new HederaAnoncredsRegistry(config);

  try {
    const result = await registry.getRevocationStatusList(revocationRegistryId, timestamp);
    console.log('Revocation status list result:', result);
  } catch (error) {
    console.error('Failed to get revocation status list:', error);
  }
}

main();
