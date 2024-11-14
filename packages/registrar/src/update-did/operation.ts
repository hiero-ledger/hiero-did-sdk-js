import { InternalPublisher } from '@hashgraph-did-sdk/publisher-internal';
import { UpdateDIDOptions, UpdateDIDResult } from './interface';
import { Providers } from '../interfaces';
import { getPublisher } from '../shared/get-publisher';
import { getSigner } from '../shared/get-signer';
import { callOperation } from './sub-operations';

/**
 * Update a DID on the Hedera network.
 * Supports multiple operations in a single request.
 * If bulk operations are provided, they will be executed in order.
 * Each operation is executed in a separate transaction.
 * Currently, only the following operations are supported:
 * - AddVerificationMethod
 * - RemoveVerificationMethod
 * @param operationOptions Options for updating a DID
 * @param operationProviders Providers for updating a DID
 * @returns The result of updating a DID
 */
export async function updateDID(
  operationOptions: UpdateDIDOptions,
  operationProviders: Providers,
): Promise<UpdateDIDResult> {
  const publisher = getPublisher(operationProviders);
  const signer = getSigner(
    operationProviders.signer,
    operationOptions.privateKey,
  );

  const updates = Array.isArray(operationOptions.updates)
    ? operationOptions.updates
    : [operationOptions.updates];

  for (const update of updates) {
    await callOperation(update, operationOptions, signer, publisher);
  }

  if (
    operationProviders.client instanceof Object &&
    publisher instanceof InternalPublisher
  ) {
    publisher.client.close();
  }

  // TODO: Resolve a DID document
  return {
    did: operationOptions.did,
    didDocument: {
      id: operationOptions.did,
      controller: '',
      verificationMethod: [],
    },
  };
}
