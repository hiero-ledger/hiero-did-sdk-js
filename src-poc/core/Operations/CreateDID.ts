import {
  DIDOwnerMessage,
  DIDOwnerMessageConstructor,
  DIDOwnerMessageHederaDefaultLifeCycle,
} from "../DIDOwnerMessage";
import { LocalPublisher, Publisher } from "../Publisher";
import { LifecycleRunner } from "../LifeCycleManager/Runner";
import { LocalSigner, Signer } from "../Signer";
import { Client } from "@hashgraph/sdk";

interface CreateDIDOptions
  extends Omit<DIDOwnerMessageConstructor, "timestamp" | "signature"> {}

interface Create {
  client: {
    privateKey: string;
    accountId: string;
  };
  privateKey: string;
}

interface Providers {
  signer: Signer;
  publisher: Publisher;
}

const getProviders = (create: Create): Providers => {
  const signer = new LocalSigner(create.privateKey);
  const client = Client.forTestnet().setOperator(
    create.client.accountId,
    create.client.privateKey
  );
  const publisher = new LocalPublisher(client);

  return { signer, publisher };
};

export async function createDID(
  options: CreateDIDOptions,
  providers: Providers | Create
) {
  const { signer, publisher } = providers ?? getProviders(providers as Create);
  // Create a DID create operation with the specified topicId, payload, signer, and publisher
  const didOwnerMessage = new DIDOwnerMessage({
    publicKey: options.publicKey,
  });

  const manager = new LifecycleRunner(DIDOwnerMessageHederaDefaultLifeCycle);

  manager.onComplete("signing", async (message: DIDOwnerMessage) => {});
  manager.onComplete("callback1", async (message: DIDOwnerMessage) => {});

  await manager.process(didOwnerMessage, { signer, publisher });

  publisher.client.close();
}
