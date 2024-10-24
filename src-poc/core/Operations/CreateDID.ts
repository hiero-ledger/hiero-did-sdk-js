import {
  DIDOwnerMessage,
  DIDOwnerMessageHederaDefaultLifeCycle,
} from "../DIDOwnerMessage";
import { LifecycleRunner } from "../LifeCycleManager/Runner";
import { LocalSigner } from "../Signer";
import { PrivateKey, PublicKey } from "@hashgraph/sdk";
import {
  DIDDocument,
  extractOptions,
  extractProviders,
  getPublisher,
  getSigner,
  Providers,
} from "./Shared";

interface CreateDIDOptions {
  controller?: string;
  topicId?: string;
  privateKey?: string | PrivateKey;
}

interface CreateDIDResult {
  did: string;
  didDocument: DIDDocument;
  privateKey?: PrivateKey;
}

export function createDID(providers: Providers): Promise<CreateDIDResult>;
export function createDID(
  options: CreateDIDOptions,
  providers: Providers
): Promise<CreateDIDResult>;
export async function createDID(
  providersOrOptions: Providers | CreateDIDOptions,
  providers?: Providers
): Promise<CreateDIDResult> {
  const operationProviders = extractProviders(providersOrOptions, providers);
  const operationOptions = extractOptions(providersOrOptions);

  const publisher = getPublisher(operationProviders);
  const signer = getSigner(
    providers?.signer,
    operationOptions.privateKey,
    true
  );

  const publicKey = await signer.publicKey();

  const didOwnerMessage = new DIDOwnerMessage({
    publicKey: PublicKey.fromString(publicKey),
    controller: operationOptions.controller,
    topicId: operationOptions.topicId,
  });

  const manager = new LifecycleRunner(DIDOwnerMessageHederaDefaultLifeCycle);

  const state = await manager.process(didOwnerMessage, { signer, publisher });

  if (providers?.client instanceof Object) {
    publisher.client.close();
  }

  if (state.status !== "success") {
    throw new Error("DID creation failed");
  }

  return {
    did: didOwnerMessage.did,
    privateKey: signer instanceof LocalSigner ? signer.privateKey : undefined,
    didDocument: {
      id: didOwnerMessage.did,
      controller: didOwnerMessage.controllerDid,
      verificationMethod: [
        {
          id: `${didOwnerMessage.did}#root-key`,
          type: "Ed25519VerificationKey2020",
          controller: didOwnerMessage.did,
          publicKeyBase58: publicKey,
        },
      ],
    },
  };
}
