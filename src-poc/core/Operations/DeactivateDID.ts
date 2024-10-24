import { LifecycleRunner } from "../LifeCycleManager/Runner";
import { PrivateKey } from "@hashgraph/sdk";
import {
  DIDDeactivateMessage,
  DIDDeactivateMessageHederaDefaultLifeCycle,
} from "../DIDDeactivateMessage";
import { DIDDocument, getPublisher, getSigner, Providers } from "./Shared";

interface DeactivateDIDOptions {
  did: string;
  privateKey?: string | PrivateKey;
}

interface DeactivateDIDResult {
  did: string;
  didDocument: DIDDocument;
}

export async function deactivateDID(
  operationOptions: DeactivateDIDOptions,
  operationProviders: Providers
): Promise<DeactivateDIDResult> {
  const publisher = getPublisher(operationProviders);
  const signer = getSigner(
    operationProviders.signer,
    operationOptions.privateKey
  );

  const didDeactivateMessage = new DIDDeactivateMessage({
    did: operationOptions.did,
  });

  const manager = new LifecycleRunner(
    DIDDeactivateMessageHederaDefaultLifeCycle
  );

  const state = await manager.process(didDeactivateMessage, {
    signer,
    publisher,
  });

  if (operationProviders.client instanceof Object) {
    publisher.client.close();
  }

  if (state.status !== "success") {
    throw new Error("DID deactivation failed");
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
