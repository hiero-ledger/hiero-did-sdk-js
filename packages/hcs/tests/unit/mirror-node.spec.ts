import NodeClient from '@hashgraph/sdk/lib/client/NodeClient';
import { isMirrorQuerySupported } from '../../src/shared';

describe('isMirrorQuerySupported', () => {
  it('returns true for a NodeClient instance', () => {
    const client = NodeClient.forTestnet();

    expect(isMirrorQuerySupported(client)).toBe(true);

    client.close();
  });

  it('returns false for a non-NodeClient object', () => {
    const client = Object.create(null);

    expect(isMirrorQuerySupported(client)).toBe(false);
  });
});