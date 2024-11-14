import { getResolver } from '../src';

describe('Core', () => {
  it('should be tested', () => {
    expect(getResolver()).toHaveProperty('hedera');
  });
});
