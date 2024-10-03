import { Client, PrivateKey } from "@hashgraph/sdk";
import { config as envConfig } from "dotenv";
import {
  LocalPublisher,
  LocalSigner,
  DIDOwnerMessage,
  KMSSigner,
  DIDOwnerMessageHederaDefaultLifeCycle,
} from "./core";

async function mainInternalMode() {
  envConfig({ path: ".env.test" });

  // Retrieve account ID and private key
  const accountId = process.env.OPERATOR_ID as string;
  const privateKey = process.env.OPERATOR_PRIVATE_KEY as string;

  // Initialize Hedera testnet client
  const client = Client.forTestnet().setOperator(accountId, privateKey);

  const signer = new LocalSigner(privateKey);
  const publisher = new LocalPublisher(client);

  // Create a DID create operation with the specified topicId, payload, signer, and publisher
  const didOwnerMessage = await new DIDOwnerMessage({
    publicKey: PrivateKey.fromStringDer(privateKey).publicKey,
    controller:
      "did:hedera:testnet:z8brLDSMuByWYqd1A7yUhaiL8T2LKcxeUdihD4GmHdzar_0.0.4388790",
  }).execute(signer, publisher);

  client.close();
}

async function mainExternalMode() {
  envConfig({ path: ".env.test" });

  // Retrieve account ID and private key
  const accountId = process.env.OPERATOR_ID as string;
  const privateKey = process.env.OPERATOR_PRIVATE_KEY as string;

  // Initialize Hedera testnet client
  const client = Client.forTestnet().setOperator(accountId, privateKey);

  const signer = new KMSSigner({
    url: "http://localhost:8080",
    credentials: {
      accessKeyId: "access",
      secretAccessKey: "secret",
    },
  });
  const publisher = new LocalPublisher(client);

  // Create a DID create operation with the specified topicId, payload, signer, and publisher
  const didOwnerMessage = new DIDOwnerMessage({
    publicKey: PrivateKey.fromStringDer(privateKey).publicKey,
    controller:
      "did:hedera:testnet:z8brLDSMuByWYqd1A7yUhaiL8T2LKcxeUdihD4GmHdzar_0.0.4388790",
  });

  await DIDOwnerMessageHederaDefaultLifeCycle.start(
    didOwnerMessage,
    signer,
    publisher
  );

  client.close();
}

async function mainClientMode() {
  envConfig({ path: ".env.test" });

  // Retrieve account ID and private key
  const accountId = process.env.OPERATOR_ID as string;
  const privateKey = process.env.OPERATOR_PRIVATE_KEY as string;

  // Initialize Hedera testnet client
  const client = Client.forTestnet().setOperator(accountId, privateKey);

  const signer = new KMSSigner({
    url: "http://localhost:8080",
    credentials: {
      accessKeyId: "access",
      secretAccessKey: "secret",
    },
  });
  const publisher = new LocalPublisher(client);

  // Create a DID create operation with the specified topicId, payload, signer, and publisher
  const didOwnerMessage = new DIDOwnerMessage({
    publicKey: PrivateKey.fromStringDer(privateKey).publicKey,
    controller:
      "did:hedera:testnet:z8brLDSMuByWYqd1A7yUhaiL8T2LKcxeUdihD4GmHdzar_0.0.4388790",
  });

  // Why need new LifeCycleManager for CSM?
  await DIDOwnerMessageHederaDefaultLifeCycle.start(
    didOwnerMessage,
    signer,
    publisher
  );

  client.close();
}

mainInternalMode();
