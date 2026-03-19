import { type Client } from '@hiero-ledger/sdk';
import NodeClient from '@hiero-ledger/sdk/lib/client/NodeClient';

/**
 * Check the mirror query supported and can be used
 */
export function isMirrorQuerySupported(client: Client): boolean {
  return client instanceof NodeClient;
}
