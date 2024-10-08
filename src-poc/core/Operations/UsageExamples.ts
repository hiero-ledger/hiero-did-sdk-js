import { CreateDID, VaultSigner } from '@hashgraph-did-sdk/core';

// Initialize custom client and signer
const client = { /* Client logic */ };
const signer = { /* Signer logic */ };

// Set up VaultSigner for external key management
const vaultSigner = new VaultSigner({ /* Vault configuration */ });


// Example 1: Create DID with internal secret management (Hedera client)
const [did1, privateKey1] = await CreateDID();
console.log('DID (internal secret):', did1);
console.log('Private key (internal secret):', privateKey1);

// Example 2: Create DID with external secret management (VaultSigner)
const did2 = await CreateDID({ signer: vaultSigner });
console.log('DID (external secret with VaultSigner):', did2);

// Example 3: Create DID with client-managed secret management
const did3 = await CreateDID({ /* TBD */ });
console.log('DID (client-managed secret):', did3);

// Example 4: Create DID with custom client and signer
const provider = { client, signer };
const did4 = await CreateDID(provider);
console.log('DID (custom client and signer):', did4);