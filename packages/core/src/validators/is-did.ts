import { Network } from '../interfaces';

// Constants
const VALID_NETWORKS: Network[] = ['mainnet', 'testnet'];

const BASE58_CHARS =
  '123456789ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz';
const BASE58_PUBLIC_KEY_PATTERN = `[${BASE58_CHARS}]{43,44}`; // 44 base58 chars

// Regex patterns
const NETWORK_PATTERN = `(${VALID_NETWORKS.join('|')})`;
const TOPIC_ID_PATTERN = '\\d+\\.\\d+\\.\\d+';
const HEDERA_DID_PATTERN = new RegExp(
  `^did:hedera:${NETWORK_PATTERN}:${BASE58_PUBLIC_KEY_PATTERN}_${TOPIC_ID_PATTERN}$`,
);

/**
 * Validates if a string is a valid Hedera DID according to the specification:
 * {@link https://github.com/hashgraph/did-method/blob/master/hedera-did-method-specification.md#21-namespace-specific-identifier-nsi}
 *
 * @param did - The DID string to validate
 * @returns boolean indicating if the DID is valid
 */
export function isHederaDID(did: string): boolean {
  if (!did || typeof did !== 'string') {
    return false;
  }
  return HEDERA_DID_PATTERN.test(did);
}
