import { parseDID } from '@hiero-did-sdk/core';
import {
  ANONCREDS_IDENTIFIER_SEPARATOR,
  ANONCREDS_OBJECT_FAMILY,
  ANONCREDS_VERSION,
  AnonCredsObjectType,
  buildAnonCredsIdentifier,
  parseAnonCredsIdentifier,
} from '../../src/utils';

jest.mock('@hiero-did-sdk/core', () => ({
  parseDID: jest.fn(),
}));

describe('Anoncreds Identifier Utils', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('buildAnonCredsIdentifier', () => {
    it('should build the identifier correctly', () => {
      const id = 'did:hedera:testnet:abc123/anoncreds/v1/SCHEMA/0.0.12345';

      const publisherDid = 'did:hedera:testnet:abc123';
      const topicId = '0.0.12345';
      const objectType = AnonCredsObjectType.SCHEMA;

      const result = buildAnonCredsIdentifier(publisherDid, topicId, objectType);

      expect(result).toBe(id);
    });
  });

  describe('parseAnonCredsIdentifier', () => {
    const mockParsedDID = {
      method: 'hedera',
      network: 'testnet',
      publicKey: 'mockPublicKey',
      topicId: 'mockTopicId',
    };

    beforeEach(() => {
      (parseDID as jest.Mock).mockReturnValue(mockParsedDID);
    });

    it('should parse a valid anoncreds identifier', () => {
      const did = 'did:hedera:testnet:abc123';
      const identifier = [
        did,
        ANONCREDS_OBJECT_FAMILY,
        ANONCREDS_VERSION,
        AnonCredsObjectType.REV_REG,
        '0.0.99999',
      ].join(ANONCREDS_IDENTIFIER_SEPARATOR);

      const result = parseAnonCredsIdentifier(identifier);

      expect(parseDID).toHaveBeenCalledWith(did);
      expect(result).toEqual({
        issuerDid: did,
        method: mockParsedDID.method,
        networkName: mockParsedDID.network,
        issuerPublicKey: mockParsedDID.publicKey,
        didDocumentTopicId: mockParsedDID.topicId,
        objectFamilyName: ANONCREDS_OBJECT_FAMILY,
        version: ANONCREDS_VERSION,
        objectTypeName: AnonCredsObjectType.REV_REG,
        topicId: '0.0.99999',
      });
    });

    it('should handle identifiers with unexpected format by returning correct split parts', () => {
      const id = 'did-sample/anoncreds/v1';
      (parseDID as jest.Mock).mockReturnValue({
        method: 'sample',
        network: 'net',
        publicKey: 'pub',
        topicId: 'topic',
      });

      const result = parseAnonCredsIdentifier(id);

      expect(result.issuerDid).toBe('did-sample');
      expect(result.objectFamilyName).toBe('anoncreds');
      expect(result.version).toBe('v1');
      expect(result.objectTypeName).toBeUndefined();
      expect(result.topicId).toBeUndefined();
    });
  });
});
