import {
  DIDOwnerMessage,
  DIDOwnerMessageConstructor,
  DIDOwnerMessageHederaDefaultLifeCycle,
} from "../DIDOwnerMessage";
import { Publisher } from "../Publisher";
import { LifecycleRunner } from "../LifeCycleManager/Runner";
import { Signer } from "../Signer";

interface CreateDIDOptions
  extends Omit<DIDOwnerMessageConstructor, "timestamp" | "signature"> {}

interface Providers {
  signer: Signer;
  publisher: Publisher;
}

export async function createDID(
  options: CreateDIDOptions,
  providers: Providers
) {
  const { signer, publisher } = providers;
  // Create a DID create operation with the specified topicId, payload, signer, and publisher
  const didOwnerMessage = new DIDOwnerMessage({
    publicKey: options.publicKey,
  });

  await new LifecycleRunner(DIDOwnerMessageHederaDefaultLifeCycle).process(
    didOwnerMessage,
    { signer, publisher }
  );
}
