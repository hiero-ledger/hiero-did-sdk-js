import { type Client } from '@hashgraph/sdk';
import { isMirrorQuerySupported } from '../../src/shared';

describe('isMirrorQuerySupported', () => {
  it('returns true when client.constructor.name is NodeClient', () => {
    const client = {
      constructor: {
        name: 'NodeClient',
      },
    } as unknown as Client;

    expect(isMirrorQuerySupported(client)).toBe(true);
  });

  it('returns false when client.constructor.name is not NodeClient', () => {
    const client = {
      constructor: {
        name: 'WebClient',
      },
    } as unknown as Client;

    expect(isMirrorQuerySupported(client)).toBe(false);
  });
});
