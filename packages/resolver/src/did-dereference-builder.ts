import {
  DIDDereferenceResolution,
  DIDDocument,
  JsonLdService,
  JsonLdVerificationMethod,
  DIDResolution,
  Service,
  ServiceEndpoint,
  VerificationMethod,
} from '@swiss-digital-assets-institute/core';

export class DIDDereferenceBuilder {
  private fragment?: string;
  private params?: Record<string, string>;

  private constructor(private didResolution: DIDResolution) {}

  private get hasFragment(): boolean {
    return this.fragment !== undefined && this.fragment.length > 0;
  }

  private get hasParams(): boolean {
    return this.params !== undefined && Object.keys(this.params).length > 0;
  }

  withFragment(fragment?: string): this {
    if (fragment) {
      this.fragment = fragment;
    }
    return this;
  }

  withParams(params: Record<string, string>): this {
    if (Object.keys(params).length > 0) {
      this.params = params;
    }
    return this;
  }

  toJson(): Service | VerificationMethod | ServiceEndpoint {
    if (this.hasFragment) {
      const fragmentData = this.dereferenceFragment();

      if (!fragmentData) {
        throw new Error('Fragment not found in DID document');
      }

      return fragmentData;
    }

    if (this.hasParams) {
      const queryData = this.dereferenceQuery();

      if (!queryData) {
        throw new Error('Query not found in DID document');
      }

      return queryData;
    }

    throw new Error('Unsupported DID URL');
  }

  toJsonLd(): JsonLdService | JsonLdVerificationMethod | ServiceEndpoint {
    const data = this.toJson();

    if (typeof data === 'string') {
      return data;
    }

    return {
      '@context': this.didResolution.didDocument['@context'],
      ...data,
    };
  }

  toResolution(): DIDDereferenceResolution {
    return {
      contentStream: this.toJsonLd(),
      dereferencingMetadata: this.didResolution.didDocumentMetadata,
      contentMetadata: this.didResolution.didResolutionMetadata,
    };
  }

  /**
   * Dereference a fragment from a DID document.
   * @param didDocument The DID document to dereference.
   * @param fragment The fragment to dereference.
   * @returns The dereferenced fragment or null if not found.
   */
  private dereferenceFragment(): Service | VerificationMethod | null {
    const documentPropertyKeys = Object.keys(
      this.didResolution.didDocument,
    ) as (keyof DIDDocument)[];

    for (const key of documentPropertyKeys) {
      const service = this.didResolution.didDocument[key];

      if (typeof service === 'string') {
        continue;
      }

      for (const item of service) {
        if (typeof item === 'string') {
          continue;
        }

        if (
          item.id === `#${this.fragment}` ||
          item.id === `${this.didResolution.didDocument.id}#${this.fragment}`
        ) {
          return item;
        }
      }
    }

    return null;
  }

  /**
   * Dereference a query from a DID document.
   * @param didDocument The DID document to dereference.
   * @param params The query parameters to dereference.
   * @returns The dereferenced query or null if not found.
   */
  private dereferenceQuery(): ServiceEndpoint | null {
    const services = this.didResolution.didDocument.service;

    const serviceRef = this.params['service'];
    const relativeRef = this.params['relativeRef'];
    const versionTime = this.params['versionTime'];
    const versionId = this.params['versionId'];
    const hl = this.params['hl'];

    if (hl || versionTime || versionId) {
      throw new Error(
        'HL, versionTime, and versionId params are not supported',
      );
    }

    if (!services) {
      return null;
    }

    for (const service of services) {
      if (!service.id.endsWith(`#${serviceRef}`)) {
        continue;
      }

      let serviceEndpoint: ServiceEndpoint;

      if (Array.isArray(service.serviceEndpoint)) {
        throw new Error('Multiple service endpoints are not supported');
      } else {
        serviceEndpoint = service.serviceEndpoint;
      }

      if (typeof serviceEndpoint !== 'string') {
        throw new Error('This service endpoint type is not supported');
      }

      const parsedUrl = serviceEndpoint.endsWith('/')
        ? serviceEndpoint
        : `${serviceEndpoint}/`;

      if (!relativeRef) {
        return parsedUrl;
      }

      return relativeRef.startsWith('/')
        ? `${parsedUrl}${relativeRef.slice(1)}`
        : `${parsedUrl}${relativeRef}`;
    }

    return null;
  }

  static fromResolution(resolution: DIDResolution) {
    return new DIDDereferenceBuilder(resolution);
  }
}
