import {
  DIDOwnerMessage,
  DIDOwnerMessageHederaDefaultLifeCycle,
} from "../DIDOwnerMessage";
import { LocalPublisher } from "../Publisher";
import { LifecycleRunner } from "../LifeCycleManager/Runner";
import { LocalSigner, Signer } from "../Signer";
import { Client, PrivateKey, PublicKey } from "@hashgraph/sdk";

interface ClientOptions {
  privateKey: string | PrivateKey;
  accountId: string;
  network: "testnet" | "mainnet";
}

type ClientOrOptions = ClientOptions | Client;

interface Providers {
  client: ClientOrOptions;
  signer?: Signer;
}

interface DIDDocument {
  id: string;
  controller: string;
  verificationMethod: any[];
}

interface CreateUsingPrivateKey {
  privateKey: string | PrivateKey;
}

interface CreateWithTopicId {
  topicId: string;
}

interface BasicCreateOptions {
  controller?: string;
}

type Options =
  | BasicCreateOptions
  | (CreateWithTopicId & BasicCreateOptions)
  | (CreateUsingPrivateKey & BasicCreateOptions)
  | (CreateUsingPrivateKey & CreateWithTopicId & BasicCreateOptions);

interface Example1Result {
  did: string;
  didDocument: DIDDocument;
  privateKey?: PrivateKey;
}

function getClient(clientOrOptions: ClientOrOptions): Client {
  if (clientOrOptions instanceof Client) {
    return clientOrOptions;
  }

  let client: Client;
  switch (clientOrOptions.network) {
    case "mainnet":
      client = Client.forMainnet();
      break;
    default:
    case "testnet":
      client = Client.forTestnet();
      break;
  }

  client.setOperator(clientOrOptions.accountId, clientOrOptions.privateKey);
  return client;
}

function getSigner(signer?: Signer, privateKey?: string | PrivateKey): Signer {
  if (!signer && !privateKey) {
    throw new Error("Either signer or privateKey must be provided");
  }

  // @ts-ignore
  return (
    signer ??
    new LocalSigner(
      privateKey instanceof PrivateKey
        ? privateKey.toStringDer()
        : privateKey ?? undefined
    )
  );
}

export function createDID(providers: Providers): Promise<Example1Result>;
export function createDID(
  options: Options,
  providers: Providers
): Promise<Example1Result>;
export async function createDID(
  providersOrOptions: Providers | Options,
  providers?: Providers
): Promise<Example1Result> {
  const client = getClient(
    providers
      ? providers.client
      : // @ts-ignore
        (providersOrOptions.client as ClientOrOptions)
  );

  const signer = getSigner(
    providers?.signer,
    "privateKey" in providersOrOptions
      ? providersOrOptions.privateKey
      : undefined
  );

  const publisher = new LocalPublisher(client);

  const publicKey = await signer.publicKey();

  const didOwnerMessage = new DIDOwnerMessage({
    publicKey: PublicKey.fromString(publicKey),
    controller:
      "controller" in providersOrOptions ? providersOrOptions.controller : "",
  });

  const manager = new LifecycleRunner(DIDOwnerMessageHederaDefaultLifeCycle);

  await manager.process(didOwnerMessage, { signer, publisher });

  return {
    did: didOwnerMessage.did,
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
