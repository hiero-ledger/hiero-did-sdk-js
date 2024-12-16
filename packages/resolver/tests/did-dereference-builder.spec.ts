import { DIDDereferenceBuilder } from '../src/did-dereference-builder';
import { DID_RESOLUTION } from './helpers';

describe('DID Dereference Builder', () => {
  it('should create a new instance', () => {
    const builder = DIDDereferenceBuilder.fromResolution(DID_RESOLUTION);

    expect(builder).toBeDefined();
  });

  describe('withFragment', () => {
    it('should set the fragment', () => {
      const builder = DIDDereferenceBuilder.fromResolution(DID_RESOLUTION);

      builder.withFragment('did-root-key');

      expect(builder['fragment']).toBe('did-root-key');
    });

    it('should not set the fragment if it is not provided', () => {
      const builder = DIDDereferenceBuilder.fromResolution(DID_RESOLUTION);

      builder.withFragment();

      expect(builder['fragment']).toBeUndefined();
    });

    it('should not set the fragment if it is an empty string', () => {
      const builder = DIDDereferenceBuilder.fromResolution(DID_RESOLUTION);

      builder.withFragment('');

      expect(builder['fragment']).toBeUndefined();
    });

    it('should return true if the fragment is set', () => {
      const builder = DIDDereferenceBuilder.fromResolution(DID_RESOLUTION);

      builder.withFragment('did-root-key');

      expect(builder['hasFragment']).toBe(true);
    });
  });

  describe('withParams', () => {
    it('should set the params', () => {
      const builder = DIDDereferenceBuilder.fromResolution(DID_RESOLUTION);

      builder.withParams({ foo: 'bar' });

      expect(builder['params']).toEqual({ foo: 'bar' });
    });

    it('should not set the params if they are not provided', () => {
      const builder = DIDDereferenceBuilder.fromResolution(DID_RESOLUTION);

      builder.withParams({});

      expect(builder['params']).toBeUndefined();
    });

    it('should return true if the params are set', () => {
      const builder = DIDDereferenceBuilder.fromResolution(DID_RESOLUTION);

      builder.withParams({ foo: 'bar' });

      expect(builder['hasParams']).toBe(true);
    });
  });

  describe('fragment dereference', () => {
    it('should return the fragment if it is set', () => {
      const builder = DIDDereferenceBuilder.fromResolution(DID_RESOLUTION);

      builder.withFragment('did-root-key');

      expect(builder['dereferenceFragment']()).toBeDefined();
    });

    it('should return null if the fragment is not set', () => {
      const builder = DIDDereferenceBuilder.fromResolution(DID_RESOLUTION);

      expect(builder['dereferenceFragment']()).toBeNull();
    });

    it('should return the proper fragment if the fragment is a service', () => {
      const builder = DIDDereferenceBuilder.fromResolution(DID_RESOLUTION);

      builder.withFragment('srv-1');

      expect(builder['dereferenceFragment']()).toEqual(
        DID_RESOLUTION.didDocument.service[0],
      );
    });

    it('should return the proper fragment if the fragment is a verification method', () => {
      const builder = DIDDereferenceBuilder.fromResolution(DID_RESOLUTION);

      builder.withFragment('did-root-key');

      expect(builder['dereferenceFragment']()).toEqual(
        DID_RESOLUTION.didDocument.verificationMethod[0],
      );
    });

    it('should return null if the fragment is not found', () => {
      const builder = DIDDereferenceBuilder.fromResolution(DID_RESOLUTION);

      builder.withFragment('foo');

      expect(builder['dereferenceFragment']()).toBeNull();
    });
  });

  describe('query dereference', () => {
    it.each(['hl', 'versionTime', 'versionId'])(
      'should throw an error if the query is not supported [%s]',
      (param) => {
        const builder = DIDDereferenceBuilder.fromResolution(DID_RESOLUTION);

        builder.withParams({ [param]: 'bar' });

        expect(() => builder['dereferenceQuery']()).toThrow(
          'HL, versionTime, and versionId params are not supported',
        );
      },
    );

    it('should not dereference a verification method', () => {
      const builder = DIDDereferenceBuilder.fromResolution(DID_RESOLUTION);

      builder.withParams({ service: 'did-root-key' });

      expect(builder['dereferenceQuery']()).toBeNull();
    });

    it('should dereference a service to the service endpoint', () => {
      const builder = DIDDereferenceBuilder.fromResolution(DID_RESOLUTION);

      builder.withParams({ service: 'srv-2' });

      expect(builder['dereferenceQuery']()).toEqual('https://example.com/2/');
    });

    it('should add slash to the service endpoint if it is not present', () => {
      const builder = DIDDereferenceBuilder.fromResolution(DID_RESOLUTION);

      builder.withParams({ service: 'srv-1' });

      expect(builder['dereferenceQuery']()).toEqual('https://example.com/1/');
    });

    it('should add the relative reference to the service endpoint if it is provided', () => {
      const builder = DIDDereferenceBuilder.fromResolution(DID_RESOLUTION);

      builder.withParams({ service: 'srv-1', relativeRef: '/foo' });

      expect(builder['dereferenceQuery']()).toEqual(
        'https://example.com/1/foo',
      );
    });

    it('should throw an error if the service endpoint is not a string', () => {
      const builder = DIDDereferenceBuilder.fromResolution(DID_RESOLUTION);

      builder.withParams({ service: 'srv-invalid' });

      expect(() => builder['dereferenceQuery']()).toThrow(
        'This service endpoint type is not supported',
      );
    });

    it('should throw an error if the service endpoint is an array', () => {
      const builder = DIDDereferenceBuilder.fromResolution(DID_RESOLUTION);

      builder.withParams({ service: 'srv-multiple' });

      expect(() => builder['dereferenceQuery']()).toThrow(
        'Multiple service endpoints are not supported',
      );
    });

    it('should return null if did document does not have any services', () => {
      const builder = DIDDereferenceBuilder.fromResolution({
        didDocument: {
          ...DID_RESOLUTION.didDocument,
          service: undefined,
        },
        didDocumentMetadata: DID_RESOLUTION.didDocumentMetadata,
        didResolutionMetadata: DID_RESOLUTION.didResolutionMetadata,
      });

      builder.withParams({ service: 'srv-1' });

      expect(builder['dereferenceQuery']()).toBeNull();
    });
  });

  describe('resolution format', () => {
    it('should return the json format', () => {
      const builder =
        DIDDereferenceBuilder.fromResolution(DID_RESOLUTION).withFragment(
          'did-root-key',
        );

      expect(builder.toJson()).toEqual(
        DID_RESOLUTION.didDocument.verificationMethod[0],
      );
    });

    it('should return the json-ld format', () => {
      const builder =
        DIDDereferenceBuilder.fromResolution(DID_RESOLUTION).withFragment(
          'did-root-key',
        );

      expect(builder.toJsonLd()).toEqual({
        '@context': DID_RESOLUTION.didDocument['@context'],
        ...DID_RESOLUTION.didDocument.verificationMethod[0],
      });
    });

    it('should return the resolution format', () => {
      const builder =
        DIDDereferenceBuilder.fromResolution(DID_RESOLUTION).withFragment(
          'did-root-key',
        );

      expect(builder.toResolution()).toEqual({
        contentStream: builder.toJsonLd(),
        dereferencingMetadata: DID_RESOLUTION.didDocumentMetadata,
        contentMetadata: DID_RESOLUTION.didResolutionMetadata,
      });
    });

    it('should return string if the content stream is a string [json]', () => {
      const builder = DIDDereferenceBuilder.fromResolution(
        DID_RESOLUTION,
      ).withParams({
        service: 'srv-2',
      });

      expect(builder.toJson()).toEqual(
        DID_RESOLUTION.didDocument.service[1].serviceEndpoint,
      );
    });

    it('should return string if the content stream is a string [json-ld]', () => {
      const builder = DIDDereferenceBuilder.fromResolution(
        DID_RESOLUTION,
      ).withParams({
        service: 'srv-2',
      });

      expect(builder.toJsonLd()).toEqual(
        DID_RESOLUTION.didDocument.service[1].serviceEndpoint,
      );
    });
  });

  it('should throw an error if fragment is not found', () => {
    const builder = DIDDereferenceBuilder.fromResolution(DID_RESOLUTION);

    builder.withFragment('foo');

    expect(() => builder.toJson()).toThrow(
      'Fragment not found in DID document',
    );
  });

  it('should throw an error if query is not found', () => {
    const builder = DIDDereferenceBuilder.fromResolution(DID_RESOLUTION);

    builder.withParams({ service: 'foo' });

    expect(() => builder.toJson()).toThrow('Query not found in DID document');
  });

  it('should throw a unsupported error if fragment and query are not provided', () => {
    const builder = DIDDereferenceBuilder.fromResolution(DID_RESOLUTION);

    expect(() => builder.toJson()).toThrow('Unsupported DID URL');
  });
});
