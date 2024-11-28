import { PrivateKey } from '@hashgraph/sdk';
import { KeysUtility } from '@swiss-digital-assets-institute/core';
import { isHederaDID, isHederaDIDUrl } from '../src';

describe('Hedera DID validator', () => {
  it.each([
    '', // Empty string
    'did:hedera:mainnet:', // Missing public key and topic ID
    'did:hedera:mainnet:J98ruZqvaqtXE6chynQPnrjFu4qRAmofqbzVEsQXvNq4', // Missing topic ID
    'did:hedera:previewnet:J98ruZqvaqtXE6chynQPnrjFu4qRAmofqbzVEsQXvNq4_0.0.1', // Invalid network
    'did:hedera:J98ruZqvaqtXE6chynQPnrjFu4qRAmofqbzVEsQXvNq4_0.0.1', // Missing network
    'did:mainnet:J98ruZqvaqtXE6chynQPnrjFu4qRAmofqbzVEsQXvNq4_0.0.1', // Missing Hedera prefix
    'hedera:mainnet:J98ruZqvaqtXE6chynQPnrjFu4qRAmofqbzVEsQXvNq4_0.0.1', // Missing DID prefix
    'J98ruZqvaqtXE6chynQPnrjFu4qRAmofqbzVEsQXvNq4', // Missing DID prefix and topic ID
    'did:hedera:mainnet:QDui45JN8tAZyc8aNcgc8ZPHeESjrtDfA3CHgUHJhzxU8KBNAt4rPDdg1jBUPMKQ_0.0.1', // Invalid ED25519 public key
    'did:hedera:mainnet:bSJxbfGGZ5sAr7U2Bdgk1EMskb9EATHJi7rrq3rxfW6r2WVnPGitj6S9UMUvLKceUYtA_0.0.1', // Invalid ED25519 public key
    'did:hedera:mainnet:J98ruZlvaqtXE6chynQPnrjFu4qRAmofqbzVEsQXvNq4_0.0.1', // Invalid base58 public key
    'did:ethr:mainnet:0x3b0bc51ab9de1e5b7b6e34e5b960285805c41736', // Not a Hedera DID
  ])('should return false for invalid Hedera DIDs', (did) => {
    expect(isHederaDID(did)).toBe(false);
  });

  it.each([
    '', // Empty string
    'did:hedera:mainnet:', // Missing public key and topic ID
    'did:hedera:mainnet:J98ruZqvaqtXE6chynQPnrjFu4qRAmofqbzVEsQXvNq4', // Missing topic ID
    'did:hedera:previewnet:J98ruZqvaqtXE6chynQPnrjFu4qRAmofqbzVEsQXvNq4_0.0.1', // Invalid network
    'did:hedera:J98ruZqvaqtXE6chynQPnrjFu4qRAmofqbzVEsQXvNq4_0.0.1', // Missing network
    'did:mainnet:J98ruZqvaqtXE6chynQPnrjFu4qRAmofqbzVEsQXvNq4_0.0.1', // Missing Hedera prefix
    'hedera:mainnet:J98ruZqvaqtXE6chynQPnrjFu4qRAmofqbzVEsQXvNq4_0.0.1', // Missing DID prefix
    'J98ruZqvaqtXE6chynQPnrjFu4qRAmofqbzVEsQXvNq4', // Missing DID prefix and topic ID
    'did:hedera:mainnet:QDui45JN8tAZyc8aNcgc8ZPHeESjrtDfA3CHgUHJhzxU8KBNAt4rPDdg1jBUPMKQ_0.0.1', // Invalid ED25519 public key
    'did:hedera:mainnet:bSJxbfGGZ5sAr7U2Bdgk1EMskb9EATHJi7rrq3rxfW6r2WVnPGitj6S9UMUvLKceUYtA_0.0.1', // Invalid ED25519 public key
    'did:hedera:mainnet:J98ruZlvaqtXE6chynQPnrjFu4qRAmofqbzVEsQXvNq4_0.0.1', // Invalid base58 public key
    'did:ethr:mainnet:0x3b0bc51ab9de1e5b7b6e34e5b960285805c41736', // Not a Hedera DID
    'did:hedera:mainnet:J98ruZqvaqtXE6chynQPnrjFu4qRAmofqbzVEsQXvNq4_0.0.1path/sub-path', // Missing separator
  ])('should return false for invalid Hedera DID URLs', (did) => {
    expect(isHederaDIDUrl(did)).toBe(false);
  });

  it.each([
    'did:hedera:mainnet:J98ruZqvaqtXE6chynQPnrjFu4qRAmofqbzVEsQXvNq4_0.0.1',
    'did:hedera:mainnet:72WMyD2roqqXk8GmBAHyrtgGg5hUR4Dkkh3HtWWSEQ4_0.0.1',
    'did:hedera:mainnet:HZhZzgrEKVvt2PtkqzX3AkWUzKwFEtdZhriuSeuMKz3X_1.1.1',
    'did:hedera:testnet:AN8jSKuP7cuBfgW4vTFtG9WvqG5FyTQZmsKZw8ewYXwi_11.111.111111',
    'did:hedera:testnet:4nXwbafzJfvEhtcNMK6wDZrzSu5eSS6CGGPoacvGHDQw_0.0.1',
  ])('should return true for valid Hedera DIDs', (did) => {
    expect(isHederaDID(did)).toBe(true);
  });

  it.each([
    'did:hedera:mainnet:J98ruZqvaqtXE6chynQPnrjFu4qRAmofqbzVEsQXvNq4_0.0.1',
    'did:hedera:mainnet:72WMyD2roqqXk8GmBAHyrtgGg5hUR4Dkkh3HtWWSEQ4_0.0.1',
    'did:hedera:mainnet:HZhZzgrEKVvt2PtkqzX3AkWUzKwFEtdZhriuSeuMKz3X_1.1.1',
    'did:hedera:testnet:AN8jSKuP7cuBfgW4vTFtG9WvqG5FyTQZmsKZw8ewYXwi_11.111.111111',
    'did:hedera:testnet:4nXwbafzJfvEhtcNMK6wDZrzSu5eSS6CGGPoacvGHDQw_0.0.1',
    'did:hedera:mainnet:J98ruZqvaqtXE6chynQPnrjFu4qRAmofqbzVEsQXvNq4_0.0.1/path',
    'did:hedera:mainnet:J98ruZqvaqtXE6chynQPnrjFu4qRAmofqbzVEsQXvNq4_0.0.1/path/subpath/path-subpath',
    'did:hedera:mainnet:J98ruZqvaqtXE6chynQPnrjFu4qRAmofqbzVEsQXvNq4_0.0.1?versionId=1',
    'did:hedera:mainnet:J98ruZqvaqtXE6chynQPnrjFu4qRAmofqbzVEsQXvNq4_0.0.1?versionId=1&timestamp=1234567890',
    'did:hedera:mainnet:J98ruZqvaqtXE6chynQPnrjFu4qRAmofqbzVEsQXvNq4_0.0.1#public-key-0',
    'did:hedera:mainnet:J98ruZqvaqtXE6chynQPnrjFu4qRAmofqbzVEsQXvNq4_0.0.1#agent',
    'did:hedera:mainnet:J98ruZqvaqtXE6chynQPnrjFu4qRAmofqbzVEsQXvNq4_0.0.1?service=agent&relativeRef=/credentials#degree',
    'did:hedera:mainnet:J98ruZqvaqtXE6chynQPnrjFu4qRAmofqbzVEsQXvNq4_0.0.1/path/sub-path?service=agent&relativeRef=/credentials#degree',
  ])('should return true for valid Hedera DID URLs', (did) => {
    expect(isHederaDIDUrl(did)).toBe(true);
  });

  it('should return true to auto-generated DIDs', async () => {
    const privateKey = await PrivateKey.generateED25519Async();
    const publicKeyBytes = privateKey.publicKey.toBytes();
    const publicKeyBase58 = KeysUtility.fromBytes(publicKeyBytes).toBase58();
    const did = `did:hedera:mainnet:${publicKeyBase58}_0.0.1`;

    expect(isHederaDID(did)).toBe(true);
  });
});
