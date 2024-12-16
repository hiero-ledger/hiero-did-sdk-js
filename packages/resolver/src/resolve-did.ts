import {
  DIDDocument,
  DIDResolution,
  isHederaDID,
  JsonLdDIDDocument,
} from '@swiss-digital-assets-institute/core';
import { ResolveDIDOptions, Accept } from './interfaces';
import { parseDID } from './helpers';
import { TopicReader } from './topic-reader';
import { DidDocumentBuilder } from './did-document-builder';

/**
 * Resolve a DID to a DID document.
 *
 * @param did The DID to resolve.
 * @param accept The media type that the client prefers for the response. Acceptable values: application/did+json, application/did+ld+json, application/did+cbor and application/ld+json;profile="https://w3id.org/did-resolution". If not specified, the default value is application/did+ld+json.
 * @param options The options to use when resolving the DID.
 * @returns The resolved DID document.
 */
export async function resolveDID(
  did: string,
  accept: 'application/did+json',
  options?: ResolveDIDOptions,
): Promise<DIDDocument>;
export async function resolveDID(
  did: string,
  accept?: 'application/did+ld+json',
  options?: ResolveDIDOptions,
): Promise<JsonLdDIDDocument>;
export async function resolveDID(
  did: string,
  accept: 'application/ld+json;profile="https://w3id.org/did-resolution"',
  options?: ResolveDIDOptions,
): Promise<DIDResolution>;
export async function resolveDID(
  did: string,
  accept: Accept = 'application/did+ld+json',
  options: ResolveDIDOptions = {},
): Promise<DIDDocument | JsonLdDIDDocument | DIDResolution> {
  if (!isHederaDID(did)) {
    throw new Error('Unsupported DID method or invalid DID');
  }

  const { topicId, network } = parseDID(did);

  const topicReader = await new TopicReader(topicId, network).fetchAllToDate();
  const topicMessages = topicReader.getMessages();
  const didDocumentBuilder = await DidDocumentBuilder.from(topicMessages)
    .forDID(did)
    .withVerifier(options.verifier)
    .build();

  switch (accept) {
    case 'application/did+json':
      return didDocumentBuilder.toDidDocument();
    case 'application/did+ld+json':
      return didDocumentBuilder.toJsonLdDIDDocument();
    case 'application/ld+json;profile="https://w3id.org/did-resolution"':
      return didDocumentBuilder.toResolution();
    default:
      throw new Error('Unsupported `accept` value');
  }
}
