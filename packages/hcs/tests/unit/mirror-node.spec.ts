import { type Client } from '@hashgraph/sdk';
import { getMirrorNetworkNodeUrl, isMirrorQuerySupported, normalizeMirrorUrl } from '../../src/shared';

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

describe('normalizeMirrorUrl', () => {
  it('returns url unchanged if it starts with http://', () => {
    expect(normalizeMirrorUrl('http://example.com')).toBe('http://example.com');
  });

  it('returns url unchanged if it starts with https://', () => {
    expect(normalizeMirrorUrl('https://example.com')).toBe('https://example.com');
  });

  it('removes trailing slash and prepends https:// if url does not start with http(s)', () => {
    expect(normalizeMirrorUrl('example.com/')).toBe('https://example.com');
  });

  it('removes :443 port from url and prepends https:// if url does not start with http(s)', () => {
    expect(normalizeMirrorUrl('example.com:443')).toBe('https://example.com');
  });

  it('prepends https:// if url does not start with http(s) and no trailing slash or port', () => {
    expect(normalizeMirrorUrl('example.com')).toBe('https://example.com');
  });
});

describe('getMirrorNetworkNodeUrl', () => {
  it('returns normalized url if mirrorNetwork is array with at least one element', () => {
    const client = {
      mirrorNetwork: ['example.com:443'],
    } as unknown as Client;

    expect(getMirrorNetworkNodeUrl(client)).toBe('https://example.com');
  });

  it('throws error if mirrorNetwork is empty array', () => {
    const client = {
      mirrorNetwork: [],
    } as unknown as Client;

    expect(() => getMirrorNetworkNodeUrl(client)).toThrow("Mirror node doesn't defined for the used network");
  });

  it('throws error if mirrorNetwork is not an array', () => {
    const client = {
      mirrorNetwork: undefined,
    } as unknown as Client;

    expect(() => getMirrorNetworkNodeUrl(client)).toThrow("Mirror node doesn't defined for the used network");
  });
});
