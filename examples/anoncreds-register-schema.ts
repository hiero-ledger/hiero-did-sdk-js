/*
 * This example demonstrates how to register a schema
 * in the HederaAnoncredsRegistry using the `registerSchema` method.
 */
import { HederaAnoncredsRegistry } from '@hiero-did-sdk/anoncreds';
import { HederaClientConfiguration } from '@hiero-did-sdk/client';
import { AnonCredsSchema } from '../packages/anoncreds/src/specification';

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

const schema = {
  issuerId: 'did:example:issuer1',
  name: 'Example Schema',
  version: '1.0',
  attrNames: ['attr1', 'attr2'],
} satisfies AnonCredsSchema;

async function main() {
  const registry = new HederaAnoncredsRegistry(config);

  try {
    const result = await registry.registerSchema({ networkName: 'testnet', schema });
    console.log('Schema register result:', result);
  } catch (error) {
    console.error('Failed to register schema:', error);
  }
}

main();
