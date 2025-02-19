import { parseTransitPath, parseUrl } from '../src/utils';

describe('Vault signer utils', () => {
  describe('parseUrl', () => {
    it('should parse a URL string into a URL object', () => {
      const url = 'https://vault.example.com/';
      const parsedUrl = parseUrl(url);
      expect(parsedUrl).toBeInstanceOf(URL);
      expect(parsedUrl.href).toBe(url);
    });

    it('should parse a URL object', () => {
      const url = new URL('https://vault.example.com/');
      const parsedUrl = parseUrl(url);
      expect(parsedUrl).toBeInstanceOf(URL);
      expect(parsedUrl).toBe(url);
    });

    it('should throw an error if the URL is invalid', () => {
      const url = 'invalid-url';
      expect(() => parseUrl(url)).toThrow('Invalid Hashicorp Vault URL');
    });
  });

  describe('parseTransitPath', () => {
    it('should parse a transit path string', () => {
      const path = '/transit/';
      const parsedPath = parseTransitPath(path);
      expect(parsedPath).toBe('transit');
    });

    it('should parse a transit path string without leading and trailing slashes', () => {
      const path = 'transit';
      const parsedPath = parseTransitPath(path);
      expect(parsedPath).toBe('transit');
    });

    it('should parse a transit path end with leading slash', () => {
      const path = 'transit/';
      const parsedPath = parseTransitPath(path);
      expect(parsedPath).toBe('transit');
    });

    it('should parse a transit path string without trailing slash', () => {
      const path = '/transit';
      const parsedPath = parseTransitPath(path);
      expect(parsedPath).toBe('transit');
    });
  });
});
