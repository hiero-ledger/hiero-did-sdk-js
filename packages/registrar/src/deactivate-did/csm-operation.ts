import {
  DIDDeactivateMessage,
  DIDDeactivateMessageHederaCSMLifeCycle,
} from '@swiss-digital-assets-institute/messages';
import {
  LifecycleRunner,
  LifecycleRunnerOptions,
} from '@swiss-digital-assets-institute/lifecycle';
import { Publisher } from '@swiss-digital-assets-institute/publisher-internal';
import { DIDError } from '@swiss-digital-assets-institute/core';
import { resolveDID } from '@swiss-digital-assets-institute/resolver';
import { PublisherProviders } from '../interfaces';
import { getPublisher, MessageAwaiter, getDIDRootKey } from '../shared';
import {
  GenerateDeactivateDIDRequestOptions,
  DeactivateDIDRequest,
  DeactivateDIDResult,
  SubmitDeactivateDIDRequestOptions,
} from './interface';
import { Verifier } from '@swiss-digital-assets-institute/verifier-internal';

/**
 * Generate a request to deactivate a DID on the Hedera network.
 * This will initiate the process of deactivating a new DID.
 *
 * @param options The options used to deactivate the DID.
 * @param providers The providers used to deactivate the DID.
 * @returns The deactivate DID request with the message bytes and the current state.
 */
export async function generateDeactivateDIDRequest(
  options: GenerateDeactivateDIDRequestOptions,
  providers: PublisherProviders,
): Promise<DeactivateDIDRequest> {
  const operationProviders = providers;
  const requestOperationOptions = options;

  const publisher = getPublisher(operationProviders);

  const resolvedDIDDocument = await resolveDID(
    requestOperationOptions.did,
    'application/did+json',
  );

  const didRootKey = getDIDRootKey(resolvedDIDDocument);

  const didDeactivateMessage = new DIDDeactivateMessage({
    did: requestOperationOptions.did,
  });

  const manager = new LifecycleRunner(DIDDeactivateMessageHederaCSMLifeCycle);
  const runnerOptions: LifecycleRunnerOptions = {
    publisher,
  };

  // Start processing the lifecycle
  const state = await manager.process(didDeactivateMessage, runnerOptions);

  if (
    operationProviders.clientOptions instanceof Object &&
    publisher instanceof Publisher
  ) {
    publisher.client.close();
  }

  return {
    state,
    signingRequest: {
      payload: state.message.message,
      serializedPayload: state.message.messageBytes,
      multibasePublicKey: didRootKey,
      alg: 'Ed25519',
    },
  };
}

/**
 * Submit the request to deactivate a DID on the Hedera network.
 * This will complete the process of deactivating a DID with the given signature and request.
 *
 * @param options The options containing the signature and the request.
 * @param providers The providers used to deactivate the DID.
 * @returns The deactivated DID and DID document.
 */
export async function submitDeactivateDIDRequest(
  options: SubmitDeactivateDIDRequestOptions,
  providers: PublisherProviders,
): Promise<DeactivateDIDResult> {
  const publisher = getPublisher(providers);

  const { state, signature } = options;
  const message = state.message;

  const resolvedDIDDocument = await resolveDID(
    message.did,
    'application/did+json',
  );

  const didRootKey = getDIDRootKey(resolvedDIDDocument);
  const verifier = Verifier.fromMultibase(didRootKey);

  const manager = new LifecycleRunner(DIDDeactivateMessageHederaCSMLifeCycle);
  const runnerOptions: LifecycleRunnerOptions = {
    publisher,
    args: {
      signature,
      verifier,
    },
  };

  // Resume the lifecycle to set the signature
  const firstState = await manager.resume(state, runnerOptions);

  // Set up a message awaiter to wait for the message to be available in the topic
  const messageAwaiter = new MessageAwaiter(
    message.topicId,
    publisher.network(),
  )
    .forMessages([message.payload])
    .setStartsAt(new Date())
    .withWaitForTopic()
    .withTimeout(options.visibilityTimeoutMs ?? MessageAwaiter.DEFAULT_TIMEOUT);

  // Resume the lifecycle to finish the process
  const finalState = await manager.resume(firstState, runnerOptions);

  if (
    providers.clientOptions instanceof Object &&
    publisher instanceof Publisher
  ) {
    publisher.client.close();
  }

  if (finalState.status !== 'success') {
    throw new DIDError('internalError', 'Failed to deactivate the DID');
  }

  // Wait for the message to be available in the topic
  if (options.waitForDIDVisibility ?? true) {
    await messageAwaiter.wait();
  }

  return {
    did: message.did,
    didDocument: {
      id: message.did,
      controller: message.did,
      verificationMethod: [],
    },
  };
}
