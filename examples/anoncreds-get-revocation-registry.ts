/*
 * This example demonstrates how to get a revocation registry definition
 * by its identifier from the registry.
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

// Specify the existing revocationRegistryDefinitionId on the testnet here
const revocationRegistryDefinitionId =
  'did:hedera:testnet:zFAeKMsqnNc2bwEsC8oqENBvGqjpGu9tpUi3VWaFEBXBo_0.0.5896419/anoncreds/v0/REV_REG/0.0.6557893';

async function main() {
  const registry = new HederaAnoncredsRegistry(config);

  try {
    const result = await registry.getRevocationRegistryDefinition(revocationRegistryDefinitionId);
    console.log('Revocation registry definition result:', result);
  } catch (error) {
    console.error('Failed to get revocation registry definition:', error);
  }
}

main();
