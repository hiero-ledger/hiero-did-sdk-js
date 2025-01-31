import {
  extractOptions,
  extractProviders,
} from '../../src/shared/get-providers-options';
import { VALID_CREATE_DID_OPTIONS, VALID_PROVIDERS } from './helpers';

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
      expect(() => extractProviders({})).toThrow(
        'Required providers are missing',
      );
    });
  });
});
