import { before, describe, it } from "node:test";
import { ok, equal } from "node:assert";
import { config as envConfig } from "dotenv";
import { deactivateDID } from "./DeactivateDID";
import { Client, PrivateKey } from "@hashgraph/sdk";
import { createDID } from "./CreateDID";
import { LocalSigner } from "../Signer";

envConfig({ path: ".env.test" });

describe("DeactivateDID", () => {
  let did: string;
  let privateKey: PrivateKey;

  before(async () => {
    const clientOptions = {
      privateKey: process.env.OPERATOR_PRIVATE_KEY!,
      accountId: process.env.OPERATOR_ID!,
      network: "testnet",
    } as const;

    const didCreationResult = await createDID({
      client: clientOptions,
    });

    did = didCreationResult.did;
    privateKey = didCreationResult.privateKey!;

    console.log("DID created:", did);
    console.log("Private Key:", privateKey.toString());
  });

  it("should deactivate a DID using provided Private Key instance", async () => {
    const clientOptions = {
      privateKey: process.env.OPERATOR_PRIVATE_KEY!,
      accountId: process.env.OPERATOR_ID!,
      network: "testnet",
    } as const;

    const result = await deactivateDID(
      {
        did,
        privateKey,
      },
      {
        client: clientOptions,
      }
    );

    ok(result.did);
    equal(result.did, did);
    ok(result.didDocument);
  });

  it("should deactivate DID using provided Signer", async () => {
    const clientOptions = {
      privateKey: process.env.OPERATOR_PRIVATE_KEY!,
      accountId: process.env.OPERATOR_ID!,
      network: "testnet",
    } as const;

    const signer = new LocalSigner(privateKey.toStringDer());

    const result = await deactivateDID(
      {
        did,
      },
      {
        signer,
        client: clientOptions,
      }
    );

    ok(result.did);
    equal(result.did, did);
    ok(result.didDocument);
  });

  it("should deactivate a DID using provided Private Key in der format", async () => {
    const clientOptions = {
      privateKey: process.env.OPERATOR_PRIVATE_KEY!,
      accountId: process.env.OPERATOR_ID!,
      network: "testnet",
    } as const;

    const result = await deactivateDID(
      {
        did,
        privateKey: privateKey.toStringDer(),
      },
      {
        client: clientOptions,
      }
    );

    ok(result.did);
    equal(result.did, did);
    ok(result.didDocument);
  });

  it("should deactivate a DID and use self created Client instance from provided options", async () => {
    const clientOptions = {
      privateKey: process.env.OPERATOR_PRIVATE_KEY!,
      accountId: process.env.OPERATOR_ID!,
      network: "testnet",
    } as const;

    const result = await deactivateDID(
      {
        did,
        privateKey,
      },
      {
        client: clientOptions,
      }
    );

    ok(result);
  });

  it("should deactivate a DID and use provided Client instance", async () => {
    const client = Client.forTestnet().setOperator(
      process.env.OPERATOR_ID!,
      process.env.OPERATOR_PRIVATE_KEY!
    );

    const result = await deactivateDID(
      { did, privateKey },
      {
        client,
      }
    );

    client.close();

    ok(result);
  });
});
