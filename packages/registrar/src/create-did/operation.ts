import {
  DIDOwnerMessage,
  DIDOwnerMessageHederaDefaultLifeCycle,
} from '@swiss-digital-assets-institute/messages';
import {
  LifecycleRunner,
  LifecycleRunnerOptions,
} from '@swiss-digital-assets-institute/lifecycle';
import { Signer } from '@swiss-digital-assets-institute/signer-internal';
import { Publisher } from '@swiss-digital-assets-institute/publisher-internal';
import { DIDError, KeysUtility } from '@swiss-digital-assets-institute/core';
import { PublicKey } from '@hashgraph/sdk';
import { Providers } from '../interfaces';
import {
  getPublisher,
  getSigner,
  MessageAwaiter,
  extractOptions,
  extractProviders,
} from '../shared';
import { CreateDIDOptions, CreateDIDResult } from './interface';

/**
 * Create a new DID on the Hedera network.
 * @param providers The providers used to create the DID.
 * @returns The DID and DID document, along with the private key if it was generated.
 */
export function createDID(providers: Providers): Promise<CreateDIDResult>;

/**
 * Create a new DID on the Hedera network.
 * @param options The options used to create the DID.
 * @param providers The providers used to create the DID.
 * @returns The DID and DID document, along with the private key if it was generated.
 */
export function createDID(
  options: CreateDIDOptions,
  providers: Providers,
): Promise<CreateDIDResult>;
export async function createDID(
  providersOrOptions: Providers | CreateDIDOptions,
  providers?: Providers,
): Promise<CreateDIDResult> {
  const operationProviders = extractProviders(providersOrOptions, providers);
  const operationOptions = extractOptions(providersOrOptions);

  const publisher = getPublisher(operationProviders);
  const signer = getSigner(
    operationProviders.signer,
    operationOptions.privateKey,
    true,
  );

  const publicKey = await signer.publicKey();

  const didOwnerMessage = new DIDOwnerMessage({
    publicKey: PublicKey.fromStringED25519(publicKey),
    controller: operationOptions.controller,
    topicId: operationOptions.topicId,
  });

  const manager = new LifecycleRunner(DIDOwnerMessageHederaDefaultLifeCycle);
  const runnerOptions: LifecycleRunnerOptions = {
    signer,
    publisher,
  };

  // Start processing the lifecycle
  const firstState = await manager.process(didOwnerMessage, runnerOptions);

  if (firstState.status !== 'pause') {
    throw new DIDError('internalError', 'Should not be thrown');
  }

  // Set up a message awaiter to wait for the message to be available in the topic
  const messageAwaiter = new MessageAwaiter(
    didOwnerMessage.topicId,
    publisher.network(),
  )
    .forMessages([didOwnerMessage.payload])
    .setStartsAt(new Date())
    .withWaitForTopic()
    .withTimeout(
      operationOptions.visibilityTimeoutMs ?? MessageAwaiter.DEFAULT_TIMEOUT,
    );

  // Resume the lifecycle
  const secondState = await manager.resume(firstState, runnerOptions);

  if (
    operationProviders.clientOptions instanceof Object &&
    publisher instanceof Publisher
  ) {
    publisher.client.close();
  }

  if (secondState.status !== 'success') {
    throw new DIDError('internalError', 'Failed to create the DID');
  }

  // Wait for the message to be available in the topic
  if (operationOptions.waitForDIDVisibility ?? true) {
    await messageAwaiter.wait();
  }

  return {
    did: didOwnerMessage.did,
    privateKey: signer instanceof Signer ? signer.privateKey : undefined,
    didDocument: {
      id: didOwnerMessage.did,
      controller: didOwnerMessage.controllerDid,
      verificationMethod: [
        {
          id: `${didOwnerMessage.did}#did-root-key`,
          type: 'Ed25519VerificationKey2020',
          controller: didOwnerMessage.controllerDid,
          publicKeyMultibase:
            KeysUtility.fromDerString(publicKey).toMultibase(),
        },
      ],
    },
  };
}
