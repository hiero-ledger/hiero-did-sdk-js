import { isMirrorQuerySupported } from '../../src/shared';
import { Client } from '@hiero-ledger/sdk';

describe('isMirrorQuerySupported', () => {
  it('returns true for a NodeClient instance', () => {
    const client = Client.forTestnet();
    expect(isMirrorQuerySupported(client)).toBe(true);
    client.close();
  });

  it('returns false for a non-NodeClient object', () => {
    const client = Object.create(null);
    expect(isMirrorQuerySupported(client)).toBe(false);
  });
});