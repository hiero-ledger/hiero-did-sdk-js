import {
  isHederaDIDUrl,
  VerificationMethod,
  Service,
  JsonLdService,
  JsonLdVerificationMethod,
  DIDDereferenceResolution,
  ServiceEndpoint,
} from '@swiss-digital-assets-institute/core';
import { DereferenceDIDOptions, ResolveDIDOptions, Accept } from './interfaces';
import { parseDIDUrl } from './helpers';
import { DIDDereferenceBuilder } from './did-dereference-builder';
import { resolveDID } from './resolve-did';

export type DereferenceDIDResult =
  | Service
  | VerificationMethod
  | ServiceEndpoint
  | JsonLdVerificationMethod
  | JsonLdService
  | DIDDereferenceResolution
  | Uint8Array;

/**
 * Dereference a DID URL into a resource depending on the DID URL.
 *
 * @param didUrl The DID URL to dereference.
 * @param accept The media type that the client prefers for the response. Acceptable values: application/did+json, application/did+ld+json, application/did+cbor and application/ld+json;profile="https://w3id.org/did-resolution". If not specified, the default value is application/did+ld+json.
 * @param options The options to use when resolving the DID URL.
 * @returns The dereferenced resource.
 */
export async function dereferenceDID(
  didUrl: string,
  accept: 'application/did+json',
  options?: DereferenceDIDOptions,
): Promise<Service | VerificationMethod | ServiceEndpoint>;
export async function dereferenceDID(
  didUrl: string,
  accept?: 'application/did+ld+json',
  options?: DereferenceDIDOptions,
): Promise<JsonLdVerificationMethod | JsonLdService | ServiceEndpoint>;
export async function dereferenceDID(
  didUrl: string,
  accept: 'application/ld+json;profile="https://w3id.org/did-resolution"',
  options?: DereferenceDIDOptions,
): Promise<DIDDereferenceResolution>;
export async function dereferenceDID(
  didUrl: string,
  accept: 'application/did+cbor',
  options?: DereferenceDIDOptions,
): Promise<Uint8Array>;
export async function dereferenceDID(
  didUrl: string,
  accept: Accept = 'application/did+ld+json',
  options: ResolveDIDOptions = {},
): Promise<DereferenceDIDResult> {
  if (!isHederaDIDUrl(didUrl)) {
    throw new Error('Unsupported DID method or invalid DID URL');
  }

  const { fragment, params, did } = parseDIDUrl(didUrl);

  const didDocument = await resolveDID(
    did,
    'application/ld+json;profile="https://w3id.org/did-resolution"',
    options,
  );

  const didDereferenceBuilder = DIDDereferenceBuilder.fromResolution(
    didDocument,
  )
    .withFragment(fragment)
    .withParams(params);

  switch (accept) {
    case 'application/did+json':
      return didDereferenceBuilder.toJson();
    case 'application/did+ld+json':
      return didDereferenceBuilder.toJsonLd();
    case 'application/ld+json;profile="https://w3id.org/did-resolution"':
      return didDereferenceBuilder.toResolution();
    case 'application/did+cbor':
      return didDereferenceBuilder.toCbor();
    default:
      throw new Error('Unsupported `accept` value');
  }
}
