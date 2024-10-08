import { createDID, VaultSigner, CMSMLifecycle } from '@hashgraph-did-sdk/core';

// ========================================= Demo Setup =========================================

// Initialize custom client and signer
const client = { /* Client logic */ };
const signer = { /* Signer logic */ };

// Set up VaultSigner for external key management
const vaultSigner = new VaultSigner({ /* Vault configuration */ });

// Initialize custom wallet
const wallet = { /* Custom wallet */ }


// ========================================= All secret mode interfaces =========================================


// Example 1: Create DID with internal secret management (Hedera client)
const options1 = {
  privateKey: "0x...", // Replace with your private key
};
const did1 = await createDID(options1);
console.log('DID (internal secret):', did1);


// Example 3: Create DID using external secret management (VaultSigner)
const options3 = {
  keyName: "0x...", // Replace with your key name
};
const did3 = await createDID(options3, { signer: vaultSigner });
console.log('DID (external secret with VaultSigner):', did3);


// Example 4: Create DID with client-managed secret management
const pauseStep = await createDID({
  lifecycle: CMSMLifecycle,
  to: { label: 'pause' }
});

// Send the event bytes to the client for signing
const eventBytes = pauseStep.message.eventBytes;
console.log('Event bytes:', eventBytes);

// Sign the event bytes with the client wallet
const clientSignature = await wallet.sign(eventBytes);

// Resume the pipeline and create the final DID
const did = await createDID({
  lifecycle: CMSMLifecycle,
  from: pauseStep,
  to: { label: 'signing', args: { signature: clientSignature } }
});
console.log('DID (client-managed secret):', did);


// Example 5: Create DID with custom client and signer
const provider = { client, signer };
const did5 = await createDID(provider);
console.log('DID (custom client and signer):', did5);


// ========================================= Out of scope =========================================


// Example 2: Create DID with internal secret management (Hedera client) and optional topic ID
const options2 = {
  privateKey: "0x...", // Replace with your private key
  topicId: "0x...", // Replace with your desired topic ID (optional)
};
const did2 = await createDID(options2);
console.log('DID (internal secret with topic ID):', did2);

/* Note: We don’t need this right now, as Micha didn’t request it. While it might seem as simple as checking whether
  a TopicID was provided as an argument, I think that would just be a workaround and not the right approach. I believe 
  the shared topic use case will require its own lifecycle, with logic around adminKey and subjectKey setup in the 
  initialization step, among other things.
*/
