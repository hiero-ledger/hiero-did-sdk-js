import { DIDError, Network } from '../interfaces';

interface Output {
  /**
   * The method used in the DID.
   * For example, 'hedera'.
   */
  method: string;

  /**
   * The network used in the DID.
   * For example, 'mainnet'.
   */
  network: Network;

  /**
   * The public key used in the DID.
   */
  publicKey: string;

  /**
   * The topic ID used in the DID.
   */
  topicId: string;
}

/**
 * Parse a DID into its main components.
 * Extracts the method, network, publicKey and topicId.
 * @todo Validate main components.
 * @param did The DID to parse.
 * @returns DID components.
 */
export function parseDID(did: string): Output {
  const didPattern = /^did:([a-zA-Z0-9]+):([a-zA-Z0-9-]+):([a-zA-Z0-9]+)_([0-9]+\.[0-9]+\.[0-9]+)$/;

  const match = did.match(didPattern);
  if (!match) {
    throw new DIDError('invalidDid', 'Invalid DID format');
  }

  const [, method, network, publicKey, topicId] = match;

  return {
    method,
    network: network as Network,
    publicKey,
    topicId,
  };
}
