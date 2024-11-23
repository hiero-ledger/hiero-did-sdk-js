import { getResolver, resolveDID } from '../src';

jest.mock('../src/resolve-did');

describe('DID get resolver function', () => {
  it('should return a resolver function', () => {
    const resolver = getResolver();
    expect(resolver).toBeDefined();
    expect(resolver.hedera).toBeDefined();
  });

  it('should return resolver for Hedera DID', () => {
    const resolver = getResolver();
    expect(resolver).toBeDefined();
    expect(resolver).toHaveProperty('hedera');
  });

  it('should call resolveDID function with proper arguments', async () => {
    const resolver = getResolver();
    const did = 'did:hedera:testnet:1234';
    const accept = 'application/did+ld+json';
    const options = { accept };

    await resolver.hedera(did, {}, {}, options);

    expect(resolveDID).toHaveBeenCalledWith(did, accept);
  });
});
