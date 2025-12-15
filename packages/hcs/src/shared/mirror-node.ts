import { type Client } from '@hashgraph/sdk';

/**
 * Check the mirror query supported and can be used
 */
export function isMirrorQuerySupported(client: Client): boolean {
  return client.constructor.name === 'NodeClient';
}
