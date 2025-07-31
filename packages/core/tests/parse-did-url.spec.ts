import { parseDIDUrl } from '../src/parsers';

const METHOD = 'hedera';
const NETWORK = 'mainnet';
const PUBLIC_KEY = 'J98ruZqvaqtXE6chynQPnrjFu4qRAmofqbzVEsQXvNq4';
const TOPIC_ID = '0.0.1';
const DID = `did:${METHOD}:${NETWORK}:${PUBLIC_KEY}_${TOPIC_ID}`;
const PATH = '/path/sub-path';
const QUERY = '?versionId=1&timestamp=1234567890';
const EXPECTED_PARAMS = {
  versionId: '1',
  timestamp: '1234567890',
};
const FRAGMENT = 'public-key-0';

describe('Hedera DID URL parser', () => {
  it('should parse a simple Hedera DID', () => {
    const did = `did:${METHOD}:${NETWORK}:${PUBLIC_KEY}_${TOPIC_ID}`;

    const result = parseDIDUrl(did);

    expect(result).toStrictEqual({
      did: DID,
      method: METHOD,
      network: NETWORK,
      publicKey: PUBLIC_KEY,
      topicId: TOPIC_ID,
      path: undefined,
      params: {},
      fragment: undefined,
    });
  });

  it('should parse a Hedera DID with path', () => {
    const did = `did:${METHOD}:${NETWORK}:${PUBLIC_KEY}_${TOPIC_ID}${PATH}`;

    const result = parseDIDUrl(did);

    expect(result).toStrictEqual({
      did: DID,
      method: METHOD,
      network: NETWORK,
      publicKey: PUBLIC_KEY,
      topicId: TOPIC_ID,
      path: PATH,
      params: {},
      fragment: undefined,
    });
  });

  it('should parse a Hedera DID with query params', () => {
    const did = `did:${METHOD}:${NETWORK}:${PUBLIC_KEY}_${TOPIC_ID}${QUERY}`;

    const result = parseDIDUrl(did);

    expect(result).toStrictEqual({
      did: DID,
      method: METHOD,
      network: NETWORK,
      publicKey: PUBLIC_KEY,
      topicId: TOPIC_ID,
      path: undefined,
      params: EXPECTED_PARAMS,
      fragment: undefined,
    });
  });

  it('should parse a Hedera DID with fragment', () => {
    const did = `did:${METHOD}:${NETWORK}:${PUBLIC_KEY}_${TOPIC_ID}#${FRAGMENT}`;

    const result = parseDIDUrl(did);

    expect(result).toStrictEqual({
      did: DID,
      method: METHOD,
      network: NETWORK,
      publicKey: PUBLIC_KEY,
      topicId: TOPIC_ID,
      path: undefined,
      params: {},
      fragment: FRAGMENT,
    });
  });

  it('should parse a Hedera DID with fragment and path', () => {
    const did = `did:${METHOD}:${NETWORK}:${PUBLIC_KEY}_${TOPIC_ID}${PATH}#${FRAGMENT}`;

    const result = parseDIDUrl(did);

    expect(result).toStrictEqual({
      did: DID,
      method: METHOD,
      network: NETWORK,
      publicKey: PUBLIC_KEY,
      topicId: TOPIC_ID,
      path: PATH,
      params: {},
      fragment: FRAGMENT,
    });
  });

  it('should parse a Hedera DID with fragment and query params', () => {
    const did = `did:${METHOD}:${NETWORK}:${PUBLIC_KEY}_${TOPIC_ID}${QUERY}#${FRAGMENT}`;

    const result = parseDIDUrl(did);

    expect(result).toStrictEqual({
      did: DID,
      method: METHOD,
      network: NETWORK,
      publicKey: PUBLIC_KEY,
      topicId: TOPIC_ID,
      path: undefined,
      params: EXPECTED_PARAMS,
      fragment: FRAGMENT,
    });
  });

  it('should parse a Hedera DID with path and query params', () => {
    const did = `did:${METHOD}:${NETWORK}:${PUBLIC_KEY}_${TOPIC_ID}${PATH}${QUERY}`;

    const result = parseDIDUrl(did);

    expect(result).toStrictEqual({
      did: DID,
      method: METHOD,
      network: NETWORK,
      publicKey: PUBLIC_KEY,
      topicId: TOPIC_ID,
      path: PATH,
      params: EXPECTED_PARAMS,
      fragment: undefined,
    });
  });

  it('should parse a Hedera DID with query params, path and fragment', () => {
    const did = `did:${METHOD}:${NETWORK}:${PUBLIC_KEY}_${TOPIC_ID}${PATH}${QUERY}#${FRAGMENT}`;

    const result = parseDIDUrl(did);

    expect(result).toStrictEqual({
      did: DID,
      method: METHOD,
      network: NETWORK,
      publicKey: PUBLIC_KEY,
      topicId: TOPIC_ID,
      path: PATH,
      params: EXPECTED_PARAMS,
      fragment: FRAGMENT,
    });
  });

  it('should throw an error for an invalid Hedera DID URL', () => {
    expect(() => parseDIDUrl('did:invalid:')).toThrow('Invalid DID URL format');
  });
});
