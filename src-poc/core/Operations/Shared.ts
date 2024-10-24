import { Client, PrivateKey } from "@hashgraph/sdk";
import { LocalPublisher, Publisher } from "../Publisher";
import { LocalSigner, Signer } from "../Signer";

export interface ClientOptions {
  privateKey: string | PrivateKey;
  accountId: string;
  network: "testnet" | "mainnet";
}

export type ClientOrOptions = ClientOptions | Client;

export interface Providers {
  client: ClientOrOptions;
  signer?: Signer;
  publisher?: Publisher;
}

export function getPublisher(providers: Providers): Publisher {
  if (providers.publisher) return providers.publisher;

  const clientOrOptions = providers.client;

  if (clientOrOptions instanceof Client) {
    return new LocalPublisher(clientOrOptions);
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

  return new LocalPublisher(
    client.setOperator(clientOrOptions.accountId, clientOrOptions.privateKey)
  );
}

export function getSigner(
  signer?: Signer,
  privateKey?: string | PrivateKey,
  autoCreate = false
): Signer {
  if (signer) return signer;

  if (privateKey instanceof PrivateKey) {
    return new LocalSigner(privateKey.toStringDer());
  }

  if (privateKey) {
    return new LocalSigner(privateKey);
  }

  if (!autoCreate) {
    throw new Error("Missing signer or private key");
  }

  return LocalSigner.generate();
}

export function extractProviders<Options extends Object>(
  providersOrOptions: Providers | Options,
  providers?: Providers
): Providers {
  if (providers) return providers;

  if ("client" in providersOrOptions) {
    return providersOrOptions;
  }

  throw new Error("Invalid providers");
}

export function extractOptions<Options extends Object>(
  providersOrOptions: Providers | Options
): Options {
  if ("client" in providersOrOptions) {
    return {} as Options;
  }

  return providersOrOptions;
}

export interface DIDDocument {
  id: string;
  controller: string;
  verificationMethod: any[];
}
