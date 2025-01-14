import { DIDUpdateBuilder } from '../src/utils/did-update-builder';
import { PUBLIC_KEY_MULTIBASE, VALID_DID } from './helpers';

describe('DID Update Builder', () => {
  it('should initialize', () => {
    const builder = new DIDUpdateBuilder();
    expect(builder).toBeDefined();
  });

  it('should initialize with empty state', () => {
    const builder = new DIDUpdateBuilder();
    expect(builder.build()).toEqual([]);
  });

  it.each([
    [
      'addAuthenticationMethod',
      { operation: 'add-verification-method', property: 'authentication' },
    ],
    [
      'addAssertionMethod',
      { operation: 'add-verification-method', property: 'assertionMethod' },
    ],
    [
      'addKeyAgreementMethod',
      { operation: 'add-verification-method', property: 'keyAgreement' },
    ],
    [
      'addCapabilityDelegationMethod',
      {
        operation: 'add-verification-method',
        property: 'capabilityDelegation',
      },
    ],
    [
      'addCapabilityInvocationMethod',
      {
        operation: 'add-verification-method',
        property: 'capabilityInvocation',
      },
    ],
    [
      'addVerificationMethod',
      { operation: 'add-verification-method', property: 'verificationMethod' },
    ],
  ] as const)('should add an %s', (method, expected) => {
    const builder = new DIDUpdateBuilder();
    const verificationMethod = {
      id: '#key-1',
      controller: VALID_DID,
      publicKeyMultibase: PUBLIC_KEY_MULTIBASE,
    };

    builder[method](verificationMethod);

    expect(builder.build()).toEqual([
      {
        ...expected,
        ...verificationMethod,
      },
    ]);
  });

  it.each([
    ['removeAuthenticationMethod', { operation: 'remove-verification-method' }],
    ['removeAssertionMethod', { operation: 'remove-verification-method' }],
    ['removeKeyAgreementMethod', { operation: 'remove-verification-method' }],
    [
      'removeCapabilityDelegationMethod',
      {
        operation: 'remove-verification-method',
      },
    ],
    [
      'removeCapabilityInvocationMethod',
      {
        operation: 'remove-verification-method',
      },
    ],
    [
      'removeVerificationMethod',
      {
        operation: 'remove-verification-method',
      },
    ],
  ] as const)('should add a %s operation', (method, expected) => {
    const builder = new DIDUpdateBuilder();

    builder[method]('#key-1');

    expect(builder.build()).toEqual([{ ...expected, id: '#key-1' }]);
  });

  it('should add a service', () => {
    const builder = new DIDUpdateBuilder();
    const service = {
      id: '#service-1',
      type: 'DIDCommMessaging',
      serviceEndpoint: 'https://example.com/didcomm-messaging',
    };

    builder.addService(service);

    expect(builder.build()).toEqual([
      {
        ...service,
        operation: 'add-service',
      },
    ]);
  });

  it('should add a remove service operation', () => {
    const builder = new DIDUpdateBuilder();
    builder.removeService('#service-1');
    expect(builder.build()).toEqual([
      { operation: 'remove-service', id: '#service-1' },
    ]);
  });

  it('should handle multiple operations', () => {
    const builder = new DIDUpdateBuilder();
    builder.addAuthenticationMethod({
      id: '#key-1',
      controller: VALID_DID,
      publicKeyMultibase: PUBLIC_KEY_MULTIBASE,
    });
    builder.addService({
      id: '#service-1',
      type: 'DIDCommMessaging',
      serviceEndpoint: 'https://example.com/didcomm-messaging',
    });
    builder.removeAssertionMethod('#key-1');
    builder.removeService('#service-1');
    expect(builder.build()).toEqual([
      {
        operation: 'add-verification-method',
        id: '#key-1',
        controller: VALID_DID,
        property: 'authentication',
        publicKeyMultibase: PUBLIC_KEY_MULTIBASE,
      },
      {
        operation: 'add-service',
        id: '#service-1',
        type: 'DIDCommMessaging',
        serviceEndpoint: 'https://example.com/didcomm-messaging',
      },
      {
        operation: 'remove-verification-method',
        id: '#key-1',
      },
      { operation: 'remove-service', id: '#service-1' },
    ]);
  });
});
