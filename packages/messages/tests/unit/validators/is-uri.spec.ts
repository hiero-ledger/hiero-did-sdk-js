import { isURI } from '../../../src/validators/is-uri';

describe('Is URI validator', () => {
  it.each([
    'http://www.exaple.com/path',
    'ftp://username:password@example.com',
    'ipfs://some-cid',
    'custom-protocol://some-path',
  ])('should return true for valid URI [%s]', (uri) => {
    expect(isURI(uri)).toBeTruthy();
  });

  it.each(['', '...', 'any-string', 123, null, false, true, {}])(
    'should return false for invalid URI [%s]',
    (uri) => {
      expect(isURI(uri as never)).toBeFalsy();
    },
  );
});
