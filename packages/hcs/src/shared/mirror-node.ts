import { Client } from '@hiero-ledger/sdk';

/**
 * Check the mirror query supported and can be used
 */
export function isMirrorQuerySupported(client: Client): boolean {
  return client instanceof Client;
}
