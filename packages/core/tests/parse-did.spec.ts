import { parseDID } from '../src/parsers';

const METHOD = 'hedera';
const NETWORK = 'mainnet';
const PUBLIC_KEY = 'J98ruZqvaqtXE6chynQPnrjFu4qRAmofqbzVEsQXvNq4';
const TOPIC_ID = '0.0.1';

describe('Hedera DID parser', () => {
  it('should parse a simple Hedera DID', () => {
    const did = `did:${METHOD}:${NETWORK}:${PUBLIC_KEY}_${TOPIC_ID}`;

    const result = parseDID(did);

    expect(result).toStrictEqual({
      method: METHOD,
      network: NETWORK,
      publicKey: PUBLIC_KEY,
      topicId: TOPIC_ID,
    });
  });

  it('should throw an error for an invalid Hedera DID', () => {
    expect(() => parseDID('did:invalid:')).toThrow('Invalid DID format');
  });
});
