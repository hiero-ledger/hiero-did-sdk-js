import { Crypto } from '@hiero-did-sdk/crypto';

const data = 'Test data for sha256 calculating';
const digest = '952a959a1ac6cd9ce1d80fcd1dfd570401c0d40ab36ea9a7a2e22295fd630d3b';

describe('Crypto.sha256 (NodeJs)', () => {
  it('should hash a string input correctly with Node.js crypto', () => {
    const sha256 = Crypto.sha256(data);
    expect(sha256).toEqual(digest);
  });
});
