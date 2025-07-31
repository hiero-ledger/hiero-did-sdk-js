import { DIDError } from '@hiero-did-sdk/core';
import { Providers, PublisherProviders } from '../interfaces';

/**
 * Extract providers from options or providers object
 * @param providersOrOptions Object containing providers or options
 * @param providers Separate optional providers object
 * @throws Error if providers are not present
 * @returns Providers object
 */
export function extractProviders<Options extends object>(
  providersOrOptions: Providers | Options,
  providers?: Providers
): Providers {
  if (providers) return providers;

  if (isProviders(providersOrOptions)) {
    return providersOrOptions;
  }

  throw new DIDError('invalidArgument', 'Required providers are missing');
}

/**
 * Extract options from providers or options object
 * @param providersOrOptions Object containing providers or options
 * @returns Options object
 */
export function extractOptions<Options extends object>(
  providersOrOptions: PublisherProviders | Providers | Options
): Options {
  if (isProviders(providersOrOptions)) {
    return {} as Options;
  }

  return providersOrOptions;
}

/**
 * Check if the value is a Providers object
 * @param value Value to check
 * @returns True if the value is a Providers object
 */
const isProviders = (value: unknown): value is Providers | PublisherProviders => {
  if (!value || !(value instanceof Object)) return false;
  return 'client' in value || 'clientOptions' in value || 'signer' in value || 'publisher' in value;
};
