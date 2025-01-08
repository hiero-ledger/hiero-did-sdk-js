import {
  LifecycleRunner,
  LifecycleRunnerOptions,
} from '@swiss-digital-assets-institute/lifecycle';
import { Publisher } from '@swiss-digital-assets-institute/publisher-internal';
import {
  DIDDeactivateMessage,
  DIDDeactivateMessageHederaDefaultLifeCycle,
} from '@swiss-digital-assets-institute/messages';
import { DeactivateDIDOptions, DeactivateDIDResult } from './interface';
import { Providers } from '../interfaces';
import { getPublisher } from '../shared/get-publisher';
import { getSigner } from '../shared/get-signer';
import { MessageAwaiter } from '../shared/message-awaiter';

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

  const didDeactivateMessage = new DIDDeactivateMessage({
    did: operationOptions.did,
  });

  const manager = new LifecycleRunner(
    DIDDeactivateMessageHederaDefaultLifeCycle,
  );
  const runnerOptions: LifecycleRunnerOptions = {
    signer,
    publisher,
  };

  const firstState = await manager.process(didDeactivateMessage, runnerOptions);

  // Set up a message awaiter to wait for the message to be available in the topic
  const messageAwaiter = new MessageAwaiter(
    didDeactivateMessage.topicId,
    publisher.network(),
  )
    .forMessages([didDeactivateMessage.payload])
    .setStartsAt(new Date());

  const secondState = await manager.resume(firstState, runnerOptions);

  if (
    operationProviders.client instanceof Object &&
    publisher instanceof Publisher
  ) {
    publisher.client.close();
  }

  if (secondState.status !== 'success') {
    throw new Error('DID deactivation failed');
  }

  await messageAwaiter.wait();

  return {
    did: didDeactivateMessage.did,
    didDocument: {
      id: didDeactivateMessage.did,
      controller: didDeactivateMessage.did,
      verificationMethod: [],
    },
  };
}
