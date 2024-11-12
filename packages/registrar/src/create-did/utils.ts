import { ClientOptions, Providers } from '../interfaces';

/**
 * Extract providers from options or providers object
 * @param providersOrOptions Object containing providers or options
 * @param providers Separate optional providers object
 * @throws Error if providers are not present
 * @returns Providers object
 */
export function extractProviders<Options extends object>(
  providersOrOptions: Providers | Options,
  providers?: Providers,
): Providers {
  if (providers) return providers;

  //if ('client' in providersOrOptions) {
    return providersOrOptions;
  //}

 // throw new Error('Invalid providers');
}

/**
 * Extract options from providers or options object
 * @param providersOrOptions Object containing providers or options
 * @returns Options object
 */
export function extractOptions<Options extends object>(
  providersOrOptions: Providers | Options,
): Options {
  if ('client' in providersOrOptions) {
    return {} as Options;
  }

  return providersOrOptions as Options;
}
