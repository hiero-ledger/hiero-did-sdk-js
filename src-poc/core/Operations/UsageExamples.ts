import { VaultSigner, CMSMLifecycle } from "@hashgraph-did-sdk/core";
import { createDID } from "./CreateDID";

// ========================================= Demo Setup =========================================

// Initialize custom client and signer
const client = {
  /* Client logic */
} as any;
const signer = {
  /* Signer logic */
} as any;

// Set up VaultSigner for external key management
const vaultSigner = new VaultSigner({
  /* Vault configuration */
}) as any;

// Initialize custom wallet
const wallet = {
  /* Custom wallet */
};

// ========================================= All secret mode interfaces =========================================

/**
 * Example 0.0
 * Create a new DID in internal secret mode. The client is provided with a private key and account ID.
 * Private key is generated internally for purposes of DID root key. Controller is set to the DID itself.
 * Private key is returned as a string.
 */
const { did, didDocument, privateKey } = await createDID({
  client: {
    privateKey: "0x...", // Replace with your private key
    accountId: "0.0.0....", // Replace with your account ID
    network: "testnet",
  },
});
console.log("DID (internal secret, PrivateKey):", didDocument, privateKey);

/**
 * Example 0.1
 * Create a new DID in internal secret mode. The client is provided as an instance of Client.
 * Private key is generated internally for purposes of DID root key. Controller is set to the DID itself.  New Topic is created.
 * Private key is returned as a string.
 */
const { did, didDocument, privateKey } = await createDID({
  client,
});
console.log("DID (internal secret, PrivateKey):", didDocument, privateKey);

/**
 * Example 1.0
 * Create a new DID in internal secret mode. The client is provided as an instance of Client or as an object with client options.
 * Private key is also provided as a string and controller is set to the DID itself. New Topic is created.
 */
const options1 = {
  privateKey: "0x...", // Replace with your private key
};
const { did, didDocument } = await createDID(options1, { client });
console.log("DID (internal secret):", didDocument);

/**
 * Example 2.0
 * Create a new DID in internal secret mode. The client is provided as an instance of Client or as an object with client options.
 * Private key is also provided as a string and controller is set to the DID itself. Topic ID is also provided. User needs to provide a client that has access to the topic.
 */
const options2 = {
  privateKey: "0x...", // Replace with your private key
  topicId: "0.0.0...", // Replace with your desired topic ID (optional)
};
const { did, didDocument } = await createDID(options2, { client });
console.log("DID (internal secret with topic ID):", did2);

/**
 * Example 3.0
 * Create a new DID in external secret mode. The client is provided as an instance of Client or as an object with client options.
 * User also provide a signer that has access to the external key that is specified in the options (keyId).
 * Controller is set to the DID itself. New Topic is created.
 */
const options3 = {
  keyId: "0x...", // Replace with your key name,
};
const { did, didDocument } = await createDID({
  signer: vaultSigner.for(options3.keyId),
  client,
});
console.log("DID (external secret with VaultSigner):", did, didDocument);

// Example 4: Create DID with client-managed secret management
// Server initiates lifecycle flow and pauses
const pauseStep = await createDID({
  lifecycle: CMSMLifecycle,
  to: { label: "pause" },
});

// Server sends event bytes to client for signing
const eventBytes = pauseStep.message.eventBytes;
console.log("Event bytes:", eventBytes);

// Client signs event bytes with wallet and returns signature
const clientSignature = await wallet.sign(eventBytes);

// Server resumes lifecycle and creates final DID
const did = await createDID({
  lifecycle: CMSMLifecycle,
  from: pauseStep,
  to: { label: "signing", args: { signature: clientSignature } },
});
console.log("DID (client-managed secret):", did);

/*
sequenceDiagram
    participant Server
    participant Wallet

    Server->>Server: Initiate lifecycle flow (createDID with CMSMLifecycle)
    Server->>Server: Pause lifecycle at 'pause' step
    Server->>Wallet: Send event bytes for signing (eventBytes from pauseStep)
    Wallet->>Wallet: Sign event bytes with private key
    Wallet-->>Server: Return client signature (clientSignature)
    Server->>Server: Resume lifecycle from 'pause' step
    Server->>Server: Create final DID (createDID with clientSignature)
*/

/**
 * Example 5.0
 * Create a new DID in external secret mode. The client is provided as an instance of Client or as an object with client options.
 * New private key is generated internally using a provided signer. Controller is set to the DID itself. New Topic is created.
 */
const provider = { client, signer };
const { did, didDocument } = await createDID(provider);
console.log("DID (custom client and signer):", did5);
