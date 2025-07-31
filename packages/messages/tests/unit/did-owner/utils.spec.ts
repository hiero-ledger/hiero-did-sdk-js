import { resolveDID } from '@hiero-did-sdk/resolver';
import { DIDError } from '@hiero-did-sdk/core';
import { checkDIDExists } from '../../../src/messages/did-owner/utils';

jest.mock('@hiero-did-sdk/resolver', () => {
  return {
    resolveDID: jest.fn(),
  };
});

const resolverMock = resolveDID as jest.Mock;

describe('DID Owner utils', () => {
  describe('checkDIDExists()', () => {
    it('should return true if DID exists', async () => {
      const did = 'did:hedera:testnet:zguayisd';
      resolverMock.mockResolvedValue({ id: did });

      expect(await checkDIDExists(did)).toBe(true);
    });

    it('should return false if DID does not exist', async () => {
      const did = 'did:hedera:testnet:zguayisd';
      resolverMock.mockRejectedValue(new DIDError('notFound', 'DID not found'));

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
