/*
 * This example demonstrates how to get a schema
 * from HederaAnoncredsRegistry by schema identifier using `getSchema`.
 */
import { HederaAnoncredsRegistry } from '@hiero-did-sdk/anoncreds';
import { HederaClientConfiguration } from '@hiero-did-sdk/client';

const operatorId = process.env.HEDERA_TESTNET_OPERATOR_ID;
const operatorKey = process.env.HEDERA_TESTNET_OPERATOR_KEY;

const config = {
  networks: [
    {
      network: 'testnet',
      operatorId,
      operatorKey
    },
  ],
} satisfies HederaClientConfiguration;

// Put the existing schemaId on testnet
const schemaId = 'did:hedera:testnet:zFAeKMsqnNc2bwEsC8oqENBvGqjpGu9tpUi3VWaFEBXBo_0.0.5896419/anoncreds/v0/SCHEMA/0.0.6557796';

async function main() {
  const registry = new HederaAnoncredsRegistry(config);

  try {
    const result = await registry.getSchema(schemaId);
    console.log('Schema resolution result:', result);
  } catch (error) {
    console.error('Failed to get schema:', error);
  }
}

main();
