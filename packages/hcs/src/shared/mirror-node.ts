import { type Client } from '@hashgraph/sdk';
import NodeClient from '@hashgraph/sdk/lib/client/NodeClient';

/**
 * Check the mirror query supported and can be used
 */
export function isMirrorQuerySupported(client: Client): boolean {
  return client instanceof NodeClient;
}
