/*
 * This example demonstrates how to register a schema
 * in the HederaAnoncredsRegistry using the `registerSchema` method.
 */
import { HederaAnoncredsRegistry } from '@hiero-did-sdk/anoncreds';
import { HederaClientConfiguration } from '@hiero-did-sdk/client';
import { AnonCredsSchema } from '../packages/anoncreds/src/specification';
import { PrivateKey } from '@hashgraph/sdk';

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

const schema: AnonCredsSchema = {
  issuerId: 'did:example:issuer1',
  name: 'Example Schema',
  version: '1.0',
  attrNames: ['attr1', 'attr2'],
};

async function main() {
  const registry = new HederaAnoncredsRegistry(config);

  try {
    const result = await registry.registerSchema({
      networkName: 'testnet',
      schema,
      issuerKeyDer: PrivateKey.generate().toStringDer(),
    });
    console.log('Schema register result:', result);
  } catch (error) {
    console.error('Failed to register schema:', error);
  }
}

main();
