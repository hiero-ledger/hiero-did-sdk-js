import { DIDError } from '@hiero-did-sdk/core';

/**
 * Parse a URL string into a URL object.
 * @param url The URL string to parse.
 * @returns The URL object.
 * @throws DIDError if the URL is invalid.
 */
export const parseUrl = (url: string | URL): URL => {
  try {
    return typeof url === 'string' ? new URL(url) : url;
  } catch {
    throw new DIDError('invalidArgument', 'Invalid Hashicorp Vault URL');
  }
};

/**
 * Parse a transit path string. It removes leading and trailing slashes.
 * @param path The transit path string to parse.
 * @returns The transit path string.
 */
export const parseTransitPath = (path: string): string => {
  return path.replace(/^\/|\/$/g, '');
};
