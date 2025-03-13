import {
  DIDOwnerMessage,
  DIDOwnerMessageHederaCSMLifeCycle,
} from '@swiss-digital-assets-institute/messages';
import {
  LifecycleRunner,
  LifecycleRunnerOptions,
} from '@swiss-digital-assets-institute/lifecycle';
import { Publisher } from '@swiss-digital-assets-institute/publisher-internal';
import { Verifier } from '@swiss-digital-assets-institute/verifier-internal';
import { DIDError, KeysUtility } from '@swiss-digital-assets-institute/core';
import { OperationState, PublisherProviders } from '../interfaces';
import { getPublisher, MessageAwaiter } from '../shared';
import {
  GenerateCreateDIDRequestOptions,
  CreateDIDRequest,
  CreateDIDResult,
  SubmitCreateDIDRequestOptions,
} from './interface';

/**
 * Generate a request to create a new DID on the Hedera network.
 * This will initiate the process of creating a new DID.
 *
 * @param options The options used to create the DID.
 * @param providers The providers used to create the DID.
 * @returns The create DID request with the message bytes and the current state.
 */
export async function generateCreateDIDRequest(
  options: GenerateCreateDIDRequestOptions,
  providers: PublisherProviders,
): Promise<CreateDIDRequest> {
  const operationProviders = providers;
  const requestOperationOptions = options;

  const publisher = getPublisher(operationProviders);

  const didOwnerMessage = new DIDOwnerMessage({
    publicKey: KeysUtility.fromMultibase(
      options.multibasePublicKey,
    ).toPublicKey(),
    controller: requestOperationOptions.controller,
    topicId: requestOperationOptions.topicId,
  });

  const manager = new LifecycleRunner(DIDOwnerMessageHederaCSMLifeCycle);
  const runnerOptions: LifecycleRunnerOptions = {
    publisher,
    context: {
      topicReader: requestOperationOptions.topicReader,
    },
  };

  // Start processing the lifecycle
  const state = await manager.process(didOwnerMessage, runnerOptions);

  if (
    operationProviders.clientOptions instanceof Object &&
    publisher instanceof Publisher
  ) {
    publisher.client.close();
  }

  const serializedState: OperationState = {
    ...state,
    message: state.message.toBytes(),
  };

  return {
    state: serializedState,
    signingRequest: {
      payload: state.message.message,
      serializedPayload: state.message.messageBytes,
      multibasePublicKey: options.multibasePublicKey,
      alg: 'Ed25519',
    },
  };
}

/**
 * Submit the request to create a new DID on the Hedera network.
 * This will complete the process of creating a new DID with the given signature and request.
 *
 * @param options The options containing the signature and the request.
 * @param providers The providers used to create the DID.
 * @returns The created DID and DID document.
 */
export async function submitCreateDIDRequest(
  options: SubmitCreateDIDRequestOptions,
  providers: PublisherProviders,
): Promise<CreateDIDResult> {
  const publisher = getPublisher(providers);

  const { state, signature } = options;

  const message = DIDOwnerMessage.fromBytes(options.state.message);

  const manager = new LifecycleRunner(DIDOwnerMessageHederaCSMLifeCycle);
  const runnerOptions: LifecycleRunnerOptions = {
    publisher,
    args: {
      signature,
      verifier: new Verifier(message.publicKey),
    },
    context: {
      topicReader: options.topicReader,
    },
  };

  // Resume the lifecycle to set the signature
  const firstState = await manager.resume(
    {
      ...state,
      message,
    },
    runnerOptions,
  );

  // Set up a message awaiter to wait for the message to be available in the topic
  const messageAwaiter = new MessageAwaiter(
    message.topicId,
    await publisher.network(),
    options.topicReader,
  )
    .forMessages([message.payload])
    .setStartsAt(new Date())
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
    throw new DIDError('internalError', 'Failed to create the DID');
  }

  // Wait for the message to be available in the topic
  if (options.waitForDIDVisibility ?? true) {
    await messageAwaiter.wait();
  }

  return {
    did: message.did,
    didDocument: {
      id: message.did,
      controller: message.controllerDid,
      verificationMethod: [
        {
          id: `${message.did}#did-root-key`,
          type: 'Ed25519VerificationKey2020',
          controller: message.controllerDid,
          publicKeyMultibase: KeysUtility.fromPublicKey(
            message.publicKey,
          ).toMultibase(),
        },
      ],
    },
  };
}
