import { createDID, VaultSigner } from '@hashgraph-did-sdk/core';

// Initialize custom client and signer
const client = { /* Client logic */ };
const signer = { /* Signer logic */ };

// Set up VaultSigner for external key management
const vaultSigner = new VaultSigner({ /* Vault configuration */ });


// Example 1: Create DID with internal secret management (Hedera client)
const options1 = {
  privateKey: "0x...", // Replace with your private key
};
const did1 = await createDID(options1);
console.log('DID (internal secret):', did1);

// Example 2: Create DID with internal secret management (Hedera client) and optional topic ID
const options2 = {
  privateKey: "0x...", // Replace with your private key
  topicId: "0x...", // Replace with your desired topic ID (optional)
};
const did2 = await createDID(options2);
console.log('DID (internal secret with topic ID):', did2);

// Example 3: Create DID using external secret management (VaultSigner)
const options3 = {
  keyName: "0x...", // Replace with your key name
};
const did3 = await createDID(options3, { signer: vaultSigner });
console.log('DID (external secret with VaultSigner):', did3);

// Example 4: Create DID with client-managed secret management
const options4 = {
  // ... 
};
const did4 = await createDID(options4);
console.log('DID (client-managed secret):', did4);

// Example 5: Create DID with custom client and signer
const provider = { client, signer };
const did5 = await createDID(provider);
console.log('DID (custom client and signer):', did5);