import { resolveDID } from '@swiss-digital-assets-institute/resolver';
import { Providers } from '../interfaces';
import { CreateDIDOptions } from './interface';

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

  if (isProviders(providersOrOptions)) {
    return providersOrOptions;
  }

  throw new Error('Invalid providers');
}

/**
 * Extract options from providers or options object
 * @param providersOrOptions Object containing providers or options
 * @returns Options object
 */
export function extractOptions(
  providersOrOptions: Providers | CreateDIDOptions,
): CreateDIDOptions {
  if (isProviders(providersOrOptions)) {
    return {} as CreateDIDOptions;
  }

  return providersOrOptions;
}

/**
 * Check if the value is a Providers object
 * @param value Value to check
 * @returns True if the value is a Providers object
 */
const isProviders = (value: unknown): value is Providers => {
  if (!value || !(value instanceof Object)) return false;
  return (
    'client' in value ||
    'clientOptions' in value ||
    'signer' in value ||
    'publisher' in value
  );
};

/**
 * Check if a DID exists on the network
 * @param did The DID to check
 * @returns True if the DID exists
 */
export async function checkDIDExists(did: string): Promise<boolean> {
  try {
    const resolvedDID = await resolveDID(did);
    return !!resolvedDID;
  } catch (error) {
    if (isDidNotFoundError(error)) {
      return false;
    }
    throw error;
  }
}

/**
 * Check if the error is a DID not found error
 * @param error The object to check
 * @returns True if the error is a DID not found error
 */
// TODO: fix that with custom errors classes
const isDidNotFoundError = (error: unknown): error is Error => {
  return error instanceof Error && error.message === 'DID not found';
};
