import { isDIDMessage } from '../../src/validators/is-did-message';
import { VALID_DID } from '../helpers';

describe('isDIDMessage validator', () => {
  it.each([
    {
      message: {
        timestamp: '2021-08-26T15:00:00Z',
        operation: 'create',
        did: VALID_DID,
        event: 'event',
      },
      signature: 'signature',
    },
    {
      message: {
        timestamp: '2021-08-26T15:00:00Z',
        operation: 'update',
        did: VALID_DID,
        event: 'event',
      },
      signature: 'signature',
    },
    {
      message: {
        timestamp: '2021-08-26T15:00:00Z',
        operation: 'revoke',
        did: VALID_DID,
        event: 'event',
      },
      signature: 'signature',
    },
    {
      message: {
        timestamp: '2021-08-26T15:00:00Z',
        operation: 'delete',
        did: VALID_DID,
        event: null,
      },
      signature: 'signature',
    },
  ])('should return true for valid DIDMessage', (messageObject) => {
    expect(isDIDMessage(messageObject)).toBe(true);
  });

  it.each([
    {
      signature: 'signature',
    }, // Missing message
    {
      message: {
        timestamp: '2021-08-26T15:00:00Z',
        operation: 'create',
        did: VALID_DID,
        event: 'event',
      },
    }, // Missing signature
    {
      message: {
        timestamp: '2021-08-26T15:00:00Z',
        operation: 'create',
        did: VALID_DID,
        event: 'event',
      },
      signature: 123,
    }, // Invalid signature
    {
      message: {
        operation: 'create',
        did: VALID_DID,
        event: 'event',
      },
      signature: 'signature',
    }, // Missing timestamp
    {
      message: {
        timestamp: 123,
        operation: 'create',
        did: VALID_DID,
        event: 'event',
      },
      signature: 'signature',
    }, // Invalid timestamp
    {
      message: {
        timestamp: '2021-08-26T15:00:00Z',
        did: VALID_DID,
        event: 'event',
      },
      signature: 'signature',
    }, // Missing operation
    {
      message: {
        timestamp: '2021-08-26T15:00:00Z',
        operation: 123,
        did: VALID_DID,
        event: 'event',
      },
      signature: 'signature',
    }, // Invalid operation
    {
      message: {
        timestamp: '2021-08-26T15:00:00Z',
        operation: 'create',
        event: 'event',
      },
      signature: 'signature',
    }, // Missing DID
    {
      message: {
        timestamp: '2021-08-26T15:00:00Z',
        operation: 'create',
        did: 'invalid',
        event: 'event',
      },
      signature: 'signature',
    }, // Invalid DID
    {
      message: {
        timestamp: '2021-08-26T15:00:00Z',
        operation: 'create',
        did: VALID_DID,
      },
      signature: 'signature',
    }, // Missing event
    {
      message: {
        timestamp: '2021-08-26T15:00:00Z',
        operation: 'create',
        did: VALID_DID,
        event: 123,
      },
      signature: 'signature',
    }, // Invalid event
    {
      message: {
        timestamp: {},
        operation: {},
        did: {},
        event: {},
      },
      signature: 'signature',
    },
    {
      message: {},
      signature: 'signature',
    },
    {
      message: {
        timestamp: '2021-08-26T15:00:00Z',
        operation: 'create',
        did: VALID_DID,
        event: null,
      },
      signature: 'signature',
    }, // Invalid event
    {
      message: {
        timestamp: '2021-08-26T15:00:00Z',
        operation: 'delete',
        did: VALID_DID,
        event: 'should be null',
      },
      signature: 'signature',
    }, // Invalid event
    'invalid', // Invalid message
    {
      message: 'invalid',
      signature: 'signature',
    }, // Invalid message
  ])('should return false for invalid DIDMessage', (messageObject) => {
    expect(isDIDMessage(messageObject)).toBe(false);
  });
});
