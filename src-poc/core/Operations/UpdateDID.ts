import {
  DIDAddVerificationMethodMessage,
  DIDAddVerificationMethodMessageHederaDefaultLifeCycle,
} from "../DIDAddVerificationMethodMessage";
import {
  DIDRemoveVerificationMethodMessage,
  DIDRemoveVerificationMethodMessageHederaDefaultLifeCycle,
} from "../DIDRemoveVerificationMethodMessage";
import { LifecycleRunner } from "../LifeCycleManager/Runner";
import { PrivateKey } from "@hashgraph/sdk";
import { DIDDocument, getPublisher, getSigner, Providers } from "./Shared";
import { Signer } from "../Signer";
import { Publisher } from "../Publisher";
import { VerificationMethodProperties } from "../Shared/Interfaces";

interface AddServiceOperation {
  operation: "add-service";
  id: string;
  type: string;
  serviceEndpoint: string;
}

interface RemoveServiceOperation {
  operation: "remove-service";
  id: string;
}

interface AddVerificationMethodOperation {
  operation: "add-verification-method";
  id: string;
  property: VerificationMethodProperties;
  controller?: string;
  publicKeyMultibase: string;
}

interface RemoveVerificationMethodOperation {
  operation: "remove-verification-method";
  property: VerificationMethodProperties;
  id: string;
}

type DIDUpdateOperation =
  | AddVerificationMethodOperation
  | AddServiceOperation
  | RemoveServiceOperation
  | RemoveVerificationMethodOperation;

interface UpdateDIDOptions {
  did: string;
  updates: DIDUpdateOperation | Array<DIDUpdateOperation>;
  privateKey?: string | PrivateKey;
}

interface UpdateDIDResult {
  did: string;
  didDocument: DIDDocument;
}

export async function updateDID(
  operationOptions: UpdateDIDOptions,
  operationProviders: Providers
): Promise<UpdateDIDResult> {
  const publisher = getPublisher(operationProviders);
  const signer = getSigner(
    operationProviders.signer,
    operationOptions.privateKey
  );

  const updates = Array.isArray(operationOptions.updates)
    ? operationOptions.updates
    : [operationOptions.updates];

  for (const update of updates) {
    if (update.operation === "add-verification-method") {
      await addVerificationMethod(update, operationOptions, signer, publisher);
    }

    if (update.operation === "remove-verification-method") {
      await removeVerificationMethod(
        update,
        operationOptions,
        signer,
        publisher
      );
    }
  }

  if (operationProviders.client instanceof Object) {
    publisher.client.close();
  }

  // Resolve a DID document
  return {
    did: operationOptions.did,
    didDocument: {
      id: operationOptions.did,
      controller: "",
      verificationMethod: [],
    },
  };
}

async function addVerificationMethod(
  options: AddVerificationMethodOperation,
  operationOptions: UpdateDIDOptions,
  signer: Signer,
  publisher: Publisher
) {
  const manager = new LifecycleRunner(
    DIDAddVerificationMethodMessageHederaDefaultLifeCycle
  );

  const didUpdateMessage = new DIDAddVerificationMethodMessage({
    did: operationOptions.did,
    controller: options.controller ?? operationOptions.did,
    // verify id
    id: options.id,
    // verify publicKeyMultibase
    publicKeyMultibase: options.publicKeyMultibase,
    property: options.property,
  });

  const state = await manager.process(didUpdateMessage, {
    signer,
    publisher,
  });

  return state;
}

async function removeVerificationMethod(
  options: RemoveVerificationMethodOperation,
  operationOptions: UpdateDIDOptions,
  signer: Signer,
  publisher: Publisher
) {
  const manager = new LifecycleRunner(
    DIDRemoveVerificationMethodMessageHederaDefaultLifeCycle
  );

  const didUpdateMessage = new DIDRemoveVerificationMethodMessage({
    did: operationOptions.did,
    id: options.id,
    property: options.property,
  });

  const state = await manager.process(didUpdateMessage, {
    signer,
    publisher,
  });

  return state;
}
