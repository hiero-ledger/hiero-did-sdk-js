import { Client, PrivateKey } from "@hashgraph/sdk";
import { config as envConfig } from "dotenv";
import {
  LocalPublisher,
  LocalSigner,
  DIDOwnerMessage,
  KMSSigner,
  BlankSigner,
  DIDOwnerMessageHederaCSMLifeCycle,
  DIDOwnerMessageHederaDefaultLifeCycle,
} from "./core";
import { LifecycleRunner } from "./core/LifeCycleManager/Runner";
import { createDID } from "./core/Operations/CreateDID";

async function mainInternalMode() {
  envConfig({ path: ".env.test" });

  // Retrieve account ID and private key
  const accountId = process.env.OPERATOR_ID as string;
  const privateKey = process.env.OPERATOR_PRIVATE_KEY as string;

  const client = Client.forTestnet().setOperator(accountId, privateKey);

  const did = await createDID({
    client: client,
  });

  console.log(did);
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
  });

  await new LifecycleRunner(DIDOwnerMessageHederaDefaultLifeCycle).process(
    didOwnerMessage,
    { signer: signer.for("keyId"), publisher }
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

  const signer = new BlankSigner();
  const clientSigner = new LocalSigner(privateKey);
  const publisher = new LocalPublisher(client);

  // Create a DID create operation with the specified topicId, payload, signer, and publisher

  const didOwnerMessage = new DIDOwnerMessage({
    publicKey: PrivateKey.fromStringDer(privateKey).publicKey,
  });

  const state = await new LifecycleRunner(
    DIDOwnerMessageHederaCSMLifeCycle
  ).process(didOwnerMessage, { publisher });

  console.log(state);

  // Take needed staff from DIDOwnerMessage instance like, bytes to sign
  const bytesToSign = state.message.eventBytes;

  // Send bytes to sign to the client
  // Serialize state object and save it to the database
  // Client signs the bytes and sends the signature back
  const signature = clientSigner.sign(bytesToSign);

  // Deserialize state object from the database

  console.log(state);
  await new LifecycleRunner(DIDOwnerMessageHederaCSMLifeCycle).resume(state, {
    signature,
    publisher,
  });

  client.close();
}

mainInternalMode();
