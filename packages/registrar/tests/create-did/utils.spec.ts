import { resolveDID } from '@swiss-digital-assets-institute/resolver';
import {
  checkDIDExists,
  extractOptions,
  extractProviders,
} from '../../src/create-did/utils';
import { VALID_CREATE_DID_OPTIONS, VALID_PROVIDERS } from './helpers';

jest.mock('@swiss-digital-assets-institute/resolver', () => {
  return {
    resolveDID: jest.fn(),
  };
});

const resolverMock = resolveDID as jest.Mock;

describe('Create DID utils', () => {
  describe('extractOptions()', () => {
    it.each(VALID_CREATE_DID_OPTIONS)(
      'should extract options from a valid options object',
      (options) => {
        expect(extractOptions(options)).toEqual(options);
      },
    );

    it.each(VALID_PROVIDERS)(
      'should return blank options if object is provider object',
      (providers) => {
        expect(extractOptions(providers)).toEqual({});
      },
    );
  });

  describe('extractProviders()', () => {
    it.each(VALID_PROVIDERS)(
      'should return providers object if object is provider object',
      (providers) => {
        expect(extractProviders(providers)).toEqual(providers);
      },
    );

    it('should first return providers object if both are provided', () => {
      const options = VALID_CREATE_DID_OPTIONS[0];
      const providers = VALID_PROVIDERS[0];

      expect(extractProviders(options, providers)).toEqual(providers);
    });

    it('should throw an error if object is not a provider object', () => {
      expect(() => extractProviders({})).toThrow('Invalid providers');
    });
  });

  describe('checkDIDExists()', () => {
    it('should return true if DID exists', async () => {
      const did = 'did:hedera:testnet:zguayisd';
      resolverMock.mockResolvedValue({ id: did });

      expect(await checkDIDExists(did)).toBe(true);
    });

    it('should return false if DID does not exist', async () => {
      const did = 'did:hedera:testnet:zguayisd';
      resolverMock.mockRejectedValue(new Error('DID not found'));

      expect(await checkDIDExists(did)).toBe(false);
    });

    it('should rethrow errors other then did not found', async () => {
      const did = 'did:hedera:testnet:zguayisd';
      const error = new Error('some error');
      resolverMock.mockRejectedValue(error);

      await expect(checkDIDExists(did)).rejects.toThrow(error);
    });
  });
});
