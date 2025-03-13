import { Publisher } from '@swiss-digital-assets-institute/publisher-internal';
import { DIDError } from '@swiss-digital-assets-institute/core';
import { resolveDID } from '@swiss-digital-assets-institute/resolver';
import { Verifier } from '@swiss-digital-assets-institute/verifier-internal';
import { PublisherProviders } from '../interfaces';
import { getPublisher, MessageAwaiter, getDIDRootKey } from '../shared';
import {
  GenerateUpdateDIDRequestOptions,
  SubmitUpdateDIDRequestOptions,
  UpdateDIDRequest,
  UpdateDIDResult,
} from './interface';
import {
  prepareOperation,
  preExecuteOperation,
  executeOperation,
} from './sub-operations';
import { deserializeState } from './helpers/deserialize-state';

/**
 * Generate a request to deactivate a DID on the Hedera network.
 * This will initiate the process of deactivating a new DID.
 *
 * @param options The options used to create the DID.
 * @param providers The providers used to create the DID.
 * @returns The create DID request with the message bytes and the current state.
 */
export async function generateUpdateDIDRequest(
  options: GenerateUpdateDIDRequestOptions,
  providers: PublisherProviders,
): Promise<UpdateDIDRequest> {
  const operationProviders = providers;
  const requestOperationOptions = options;

  const publisher = getPublisher(operationProviders);

  const updates = Array.isArray(requestOperationOptions.updates)
    ? requestOperationOptions.updates
    : [requestOperationOptions.updates];

  const resolvedDIDDocument = await resolveDID(
    requestOperationOptions.did,
    'application/did+json',
    {
      topicReader: requestOperationOptions.topicReader,
    },
  );

  if (updates.length === 0) {
    return {
      states: [],
      signingRequests: {},
    };
  }

  const didRootKey = getDIDRootKey(resolvedDIDDocument);

  // Prepare updates for execution
  const preparedStateMessages = await Promise.all(
    updates.map(async (update) => {
      const preparedMessage = await prepareOperation(
        update,
        requestOperationOptions,
        resolvedDIDDocument,
        true,
        publisher,
      );

      return preparedMessage;
    }),
  );

  if (
    operationProviders.clientOptions instanceof Object &&
    publisher instanceof Publisher
  ) {
    publisher.client.close();
  }

  return {
    states: preparedStateMessages.map((state) => ({
      ...state,
      message: state.message.toBytes(),
    })),
    signingRequests: preparedStateMessages.reduce((acc, { message }, index) => {
      const operationID = `sr-${index + 1}`;

      return {
        ...acc,
        [operationID]: {
          payload: message.message,
          serializedPayload: message.messageBytes,
          multibasePublicKey: didRootKey,
          alg: 'Ed25519',
        },
      };
    }, {}),
  };
}

/**
 * Submit the request to update a DID document on the Hedera network.
 * This will complete the process of updating a DIDdocument with the given signature and request.
 *
 * @param options The options containing the signature and the request.
 * @param providers The providers used to update the DID.
 * @returns The updated DID and DID document.
 */
export async function submitUpdateDIDRequest(
  options: SubmitUpdateDIDRequestOptions,
  providers: PublisherProviders,
): Promise<UpdateDIDResult> {
  const publisher = getPublisher(providers);

  const { states, signatures } = options;

  if (states.length === 0) {
    throw new DIDError('invalidArgument', 'No states provided');
  }

  if (states.length !== Object.keys(signatures).length) {
    throw new DIDError(
      'invalidArgument',
      'Number of states and signatures do not match',
    );
  }

  const deserializedStates = deserializeState(states);

  const resolvedDIDDocument = await resolveDID(
    deserializedStates[0].message.did,
    'application/did+json',
    {
      topicReader: options.topicReader,
    },
  );
  const didRootKey = getDIDRootKey(resolvedDIDDocument);
  const verifier = Verifier.fromMultibase(didRootKey);

  const preExecutedStates = await Promise.all(
    deserializedStates.map(async (state, index) => {
      const operationID = `sr-${index + 1}`;
      const signature = signatures[operationID];

      if (!signature) {
        throw new DIDError(
          'invalidArgument',
          `Signature for ${operationID} not found`,
        );
      }

      const preparedMessage = await preExecuteOperation(
        state.operation,
        state,
        publisher,
        signature,
        verifier,
      );

      return {
        state: preparedMessage,
        operation: state.operation,
      };
    }),
  );

  // Set up a message awaiter to wait for the message to be available in the topic
  const messagesToWaitFor = preExecutedStates.map(
    ({ state }) => state.message.payload,
  );

  const messageAwaiter = new MessageAwaiter(
    preExecutedStates[0].state.message.topicId,
    publisher.network(),
    options.topicReader,
  )
    .forMessages(messagesToWaitFor)
    .setStartsAt(new Date())
    .withTimeout(options.visibilityTimeoutMs ?? MessageAwaiter.DEFAULT_TIMEOUT);

  // Execute updates
  for (const { state, operation } of preExecutedStates) {
    // TODO: Handle individual operation failures
    await executeOperation(operation, state, true, publisher);
  }

  if (
    providers.clientOptions instanceof Object &&
    publisher instanceof Publisher
  ) {
    publisher.client.close();
  }

  // Wait for the message to be available in the topic
  if (options.waitForDIDVisibility ?? true) {
    await messageAwaiter.wait();
  }

  const did = preExecutedStates[0].state.message.did;

  const updatedDidDocument = await resolveDID(did, 'application/did+json', {
    topicReader: options.topicReader,
  });

  return {
    did,
    didDocument: updatedDidDocument,
  };
}
