import { DIDError, Network } from '@hiero-did-sdk/core';

interface Output {
  /**
   * The Decentralized Identifier (DID) used in the DID URL.
   */
  did: string;

  /**
   * The method used in the DID URL.
   * For example, 'hedera'.
   */
  method: string;

  /**
   * The network used in the DID URL.
   * For example, 'mainnet'.
   */
  network: Network;

  /**
   * The public key used in the DID URL.
   */
  publicKey: string;

  /**
   * The topic ID used in the DID URL.
   */
  topicId: string;

  /**
   * The path used in the DID URL.
   */
  path: string | undefined;

  /**
   * An object containing the query parameters used in the DID URL.
   */
  params: Record<string, string>;

  /**
   * The fragment used in the DID URL.
   */
  fragment: string | undefined;
}

/**
 * Parse a DID URL into its main components.
 * Extracts the method, network, publicKey, topicId, path, query parameters, and fragment.
 * @todo Validate main components.
 * @param didUrl The DID URL to parse.
 * @returns DID URL components.
 */
export function parseDIDUrl(didUrl: string): Output {
  const didPattern =
    /^did:([a-zA-Z0-9]+):([a-zA-Z0-9-]+):([a-zA-Z0-9]+)_([0-9]+\.[0-9]+\.[0-9]+)(\/[^?#]*)?(\?[^#]*)?(#.*)?$/;

  const match = didUrl.match(didPattern);
  if (!match) {
    throw new DIDError('invalidDidUrl', 'Invalid DID URL format');
  }

  const [, method, network, publicKey, topicId, path = undefined, query = {}, fragment = undefined] = match;

  // Parse query parameters
  const params = {};
  if (query) {
    const searchParams = new URLSearchParams(query);
    for (const [key, value] of searchParams.entries()) {
      params[key] = value;
    }
  }

  return {
    did: `did:${method}:${network}:${publicKey}_${topicId}`,
    method,
    network: network as Network,
    publicKey,
    topicId,
    path,
    params,
    fragment: fragment ? fragment.slice(1) : undefined,
  };
}
