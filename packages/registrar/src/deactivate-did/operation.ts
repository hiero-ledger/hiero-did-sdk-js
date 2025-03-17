import {
  LifecycleRunner,
  LifecycleRunnerOptions,
} from '@swiss-digital-assets-institute/lifecycle';
import { Publisher } from '@swiss-digital-assets-institute/publisher-internal';
import {
  DIDDeactivateMessage,
  DIDDeactivateMessageHederaDefaultLifeCycle,
} from '@swiss-digital-assets-institute/messages';
import { DIDError } from '@swiss-digital-assets-institute/core';
import { Verifier } from '@swiss-digital-assets-institute/verifier-internal';
import { Providers } from '../interfaces';
import {
  MessageAwaiter,
  getSigner,
  getPublisher,
  getDIDRootKey,
} from '../shared';
import { DeactivateDIDOptions, DeactivateDIDResult } from './interface';
import { resolveDID } from '@swiss-digital-assets-institute/resolver';

/**
 * Deactivate a DID on the Hedera network
 * @param operationOptions Options for deactivating a DID
 * @param operationProviders Providers for deactivating a DID
 * @returns The result of deactivating a DID
 */
export async function deactivateDID(
  operationOptions: DeactivateDIDOptions,
  operationProviders: Providers,
): Promise<DeactivateDIDResult> {
  const publisher = getPublisher(operationProviders);
  const signer = getSigner(
    operationProviders.signer,
    operationOptions.privateKey,
  );

  const resolvedDIDDocument = await resolveDID(
    operationOptions.did,
    'application/did+json',
    {
      topicReader: operationOptions.topicReader,
    },
  );

  const didRootKey = getDIDRootKey(resolvedDIDDocument);
  const verifier = Verifier.fromMultibase(didRootKey);

  const didDeactivateMessage = new DIDDeactivateMessage({
    did: operationOptions.did,
  });

  const manager = new LifecycleRunner(
    DIDDeactivateMessageHederaDefaultLifeCycle,
  );
  const runnerOptions: LifecycleRunnerOptions = {
    signer,
    publisher,
    args: {
      verifier,
    },
  };

  const firstState = await manager.process(didDeactivateMessage, runnerOptions);

  // Set up a message awaiter to wait for the message to be available in the topic
  const messageAwaiter = new MessageAwaiter(
    didDeactivateMessage.topicId,
    await publisher.network(),
    operationOptions.topicReader,
  )
    .forMessages([didDeactivateMessage.payload])
    .setStartsAt(new Date())
    .withTimeout(
      operationOptions.visibilityTimeoutMs ?? MessageAwaiter.DEFAULT_TIMEOUT,
    );

  const secondState = await manager.resume(firstState, runnerOptions);

  if (
    operationProviders.client instanceof Object &&
    publisher instanceof Publisher
  ) {
    publisher.client.close();
  }

  if (secondState.status !== 'success') {
    throw new DIDError('internalError', 'Failed to deactivate the DID');
  }

  // Wait for the messages to be available in the topic before resolving the updated DID document
  if (operationOptions.waitForDIDVisibility ?? true) {
    await messageAwaiter.wait();
  }

  return {
    did: didDeactivateMessage.did,
    didDocument: {
      id: didDeactivateMessage.did,
      controller: didDeactivateMessage.did,
      verificationMethod: [],
    },
  };
}
