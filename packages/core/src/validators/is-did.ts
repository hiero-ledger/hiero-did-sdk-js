import { Network } from '../interfaces';

// Constants
const VALID_NETWORKS: Network[] = ['mainnet', 'testnet', 'local-node'];

const BASE58_CHARS = '123456789ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz';
const BASE58_PUBLIC_KEY_PATTERN = `[${BASE58_CHARS}]{43,44}`; // 44 base58 chars

// Regex patterns
const NETWORK_PATTERN = `(${VALID_NETWORKS.join('|')})`;
const TOPIC_ID_PATTERN = '\\d+\\.\\d+\\.\\d+';
const HEDERA_DID_PATTERN_BASE = `did:hedera:${NETWORK_PATTERN}:${BASE58_PUBLIC_KEY_PATTERN}_${TOPIC_ID_PATTERN}`;
const HEDERA_DID_PATTERN = new RegExp(`^${HEDERA_DID_PATTERN_BASE}$`);

const PARAM_CHAR = '[a-zA-Z0-9_.:%-]';
const PARAM = `;${PARAM_CHAR}+=${PARAM_CHAR}*`;
const PARAMS = `((${PARAM})*)`;
const PATH = `(/[^#?]*)?`;
const QUERY = `([?][^#]*)?`;
const FRAGMENT = `(#.*)?`;
const HEDERA_DID_URL_PATTERN = new RegExp(`^${HEDERA_DID_PATTERN_BASE}${PARAMS}${PATH}${QUERY}${FRAGMENT}$`);

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

/**
 * Validates if a string is a valid Hedera DID URL according to the specification:
 * {@link https://github.com/hashgraph/did-method/blob/master/hedera-did-method-specification.md#21-namespace-specific-identifier-nsi}
 *
 * @param didUrl - The DID URL string to validate
 * @returns boolean indicating if the DID URL is valid
 */
export function isHederaDIDUrl(didUrl: string): boolean {
  if (!didUrl || typeof didUrl !== 'string') {
    return false;
  }

  if (isHederaDID(didUrl)) {
    return true;
  }

  return HEDERA_DID_URL_PATTERN.test(didUrl);
}
