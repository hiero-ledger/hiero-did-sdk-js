import { Publisher } from '@hiero-did-sdk/publisher-internal';
import { resolveDID } from '@hiero-did-sdk/resolver';
import { Providers } from '../interfaces';
import { MessageAwaiter, getSigner, getPublisher, getDIDRootKey } from '../shared';
import { UpdateDIDOptions, UpdateDIDResult } from './interface';
import { prepareOperation, executeOperation } from './sub-operations';
import { Verifier } from '@hiero-did-sdk/verifier-internal';

/**
 * Update a DID on the Hedera network.
 * Supports multiple operations in a single request.
 * If bulk operations are provided, they will be executed in order.
 * Each operation is executed in a separate transaction.
 * @param operationOptions Options for updating a DID
 * @param operationProviders Providers for updating a DID
 * @returns The result of updating a DID
 */
export async function updateDID(
  operationOptions: UpdateDIDOptions,
  operationProviders: Providers
): Promise<UpdateDIDResult> {
  const publisher = getPublisher(operationProviders);
  const signer = getSigner(operationProviders.signer, operationOptions.privateKey);

  const updates = Array.isArray(operationOptions.updates) ? operationOptions.updates : [operationOptions.updates];

  const currentDidDocument = await resolveDID(operationOptions.did, 'application/did+json', {
    topicReader: operationOptions.topicReader,
  });

  if (updates.length === 0) {
    return {
      did: operationOptions.did,
      didDocument: currentDidDocument,
    };
  }

  const didRootKey = getDIDRootKey(currentDidDocument);
  const verifier = Verifier.fromMultibase(didRootKey);

  // Prepare updates for execution
  const preparedStateMessages = await Promise.all(
    updates.map(async (update) => {
      const preparedMessage = await prepareOperation(
        update,
        operationOptions,
        currentDidDocument,
        false,
        publisher,
        signer,
        verifier
      );

      return {
        state: preparedMessage,
        operation: update.operation,
      };
    })
  );

  // Set up a message awaiter to wait for the message to be available in the topic
  const messagesToWaitFor = preparedStateMessages.map(({ state }) => state.message.payload);

  const messageAwaiter = new MessageAwaiter(
    preparedStateMessages[0].state.message.topicId,
    await publisher.network(),
    operationOptions.topicReader
  )
    .forMessages(messagesToWaitFor)
    .setStartsAt(new Date())
    .withTimeout(operationOptions.visibilityTimeoutMs ?? MessageAwaiter.DEFAULT_TIMEOUT);

  // Execute updates
  for (const { state, operation } of preparedStateMessages) {
    // TODO: Handle individual operation failures
    await executeOperation(operation, state, false, publisher, signer);
  }

  if (operationProviders.client instanceof Object && publisher instanceof Publisher) {
    publisher.client.close();
  }

  // Wait for the messages to be available in the topic before resolving the updated DID document
  if (operationOptions.waitForDIDVisibility ?? true) {
    await messageAwaiter.wait();
  }

  const updatedDidDocument = await resolveDID(operationOptions.did, 'application/did+json', {
    topicReader: operationOptions.topicReader,
  });

  return {
    did: operationOptions.did,
    didDocument: updatedDidDocument,
  };
}
