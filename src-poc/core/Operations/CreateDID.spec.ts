import { describe, it } from "node:test";
import { ok, match } from "node:assert";
import { config as envConfig } from "dotenv";
import { createDID } from "./CreateDID";
import { Client, PrivateKey } from "@hashgraph/sdk";

envConfig({ path: ".env.test" });

describe("CreateDID", () => {
  it("should create a DID and return generated Private Key", async () => {
    const clientOptions = {
      privateKey: process.env.OPERATOR_PRIVATE_KEY!,
      accountId: process.env.OPERATOR_ID!,
      network: "testnet",
    } as const;

    const did = await createDID({
      client: clientOptions,
    });

    ok(did.privateKey);
    ok(did.did);
    match(did.did, /^did:hedera:testnet:([a-zA-Z0-9]+)_(\d+\.\d+\.\d+)$/);
    ok(did.didDocument);
  });

  it("should create a DID using provided Private Key instance", async () => {
    const clientOptions = {
      privateKey: process.env.OPERATOR_PRIVATE_KEY!,
      accountId: process.env.OPERATOR_ID!,
      network: "testnet",
    } as const;

    const privateKey = PrivateKey.generateED25519();

    const did = await createDID(
      {
        privateKey: privateKey,
      },
      {
        client: clientOptions,
      }
    );

    ok(did.did);
    match(did.did, /^did:hedera:testnet:([a-zA-Z0-9]+)_(\d+\.\d+\.\d+)$/);
    ok(did.didDocument);
  });

  it("should create a DID using provided Private Key der string", async () => {
    const clientOptions = {
      privateKey: process.env.OPERATOR_PRIVATE_KEY!,
      accountId: process.env.OPERATOR_ID!,
      network: "testnet",
    } as const;

    const privateKey = PrivateKey.generateED25519();

    const did = await createDID(
      {
        privateKey: privateKey.toStringDer(),
      },
      {
        client: clientOptions,
      }
    );

    ok(did.did);
    match(did.did, /^did:hedera:testnet:([a-zA-Z0-9]+)_(\d+\.\d+\.\d+)$/);
    ok(did.didDocument);
  });

  it("should create a DID and use self created Client instance from provided options", async () => {
    const clientOptions = {
      privateKey: process.env.OPERATOR_PRIVATE_KEY!,
      accountId: process.env.OPERATOR_ID!,
      network: "testnet",
    } as const;

    const did = await createDID({
      client: clientOptions,
    });

    ok(did);
  });

  it("should create a DID and use provided Client instance", async () => {
    const client = Client.forTestnet().setOperator(
      process.env.OPERATOR_ID!,
      process.env.OPERATOR_PRIVATE_KEY!
    );

    const did = await createDID({
      client,
    });

    client.close();

    ok(did);
  });
});
