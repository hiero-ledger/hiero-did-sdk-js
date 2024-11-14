export const BASE64_PATTERN = /^[A-Za-z0-9=]+$/;

export const PUBLIC_KEY_ED25519 =
  '302a300506032b6570032100c34b5240af395a9cc8d319547cc6e2d3bed99caf81d6fed9771e7999fd7b4a7c';
export const PUBLIC_KEY_BASE58 = 'E9M7htSuFPgx1nDEsbyvXR4veXSRobawSPXRytGMxhT1';
export const PUBLIC_KEY_MULTIBASE = `z${PUBLIC_KEY_BASE58}`;

export const VALID_DID_TOPIC_ID = '0.0.1';
export const VALID_DID = `did:hedera:mainnet:J98ruZqvaqtXE6chynQPnrjFu4qRAmofqbzVEsQXvNq4_${VALID_DID_TOPIC_ID}`;

export const NETWORK = 'testnet';
export const SIGNATURE = new Uint8Array([1, 2, 3, 4]);
