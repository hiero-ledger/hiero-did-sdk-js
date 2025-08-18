/*
 * This example demonstrates how to fetch a credential definition
 * from the registry by its ID.
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

// Specify the existing credentialDefinitionId on the testnet here
const credentialDefinitionId =
  'did:hedera:testnet:zFAeKMsqnNc2bwEsC8oqENBvGqjpGu9tpUi3VWaFEBXBo_0.0.5896419/anoncreds/v0/PUBLIC_CRED_DEF/0.0.6557868';

async function main() {
  const registry = new HederaAnoncredsRegistry(config);

  try {
    const result = await registry.getCredentialDefinition(credentialDefinitionId);
    console.log('Credential definition result:', result);
  } catch (error) {
    console.error('Failed to get credential definition:', error);
  }
}

main();
