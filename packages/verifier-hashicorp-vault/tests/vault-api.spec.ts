import { randomUUID } from 'crypto';
import { PublicKey } from '@hashgraph/sdk';
import { DIDError } from '@hiero-did-sdk/core';
import { VaultApi } from '../src/vault-api';
import { VaultTestContainer } from './helpers';
import { Buffer } from 'buffer';

describe('Vault API Client', () => {
  let vaultContainer: VaultTestContainer;

  beforeAll(async () => {
    vaultContainer = new VaultTestContainer();
    await vaultContainer.start();
    await vaultContainer.initialize();
  }, 180_000);

  afterAll(async () => {
    await vaultContainer.stop();
  }, 180_000);

  beforeEach(() => {
    jest.resetAllMocks();
    jest.clearAllMocks();
  });

  it('should create a new instance of the Vault API client with string URL', () => {
    const vaultApi = new VaultApi('http://vault.example');

    expect(vaultApi).toBeDefined();
    expect(vaultApi['vaultUrl'].href).toBe('http://vault.example/');
    expect(vaultApi['token']).toBeUndefined();
  });

  it('should create a new instance of the Vault API client with default transit engine path', () => {
    const vaultApi = new VaultApi('http://vault.example');

    expect(vaultApi['transitPath']).toBe('transit');
  });

  it('should create a new instance of the Vault API client with custom transit engine path', () => {
    const vaultApi = new VaultApi('http://vault.example', '/custom-path');

    expect(vaultApi['transitPath']).toBe('custom-path');
  });

  it('should create a new instance of the Vault API client with object URL', () => {
    const vaultUrl = new URL('http://vault.example');
    const vaultApi = new VaultApi(vaultUrl);

    expect(vaultApi).toBeDefined();
    expect(vaultApi['vaultUrl']).toBe(vaultUrl);
    expect(vaultApi['token']).toBeUndefined();
  });

  it('should set the authentication token for the Vault API client', () => {
    const vaultApi = new VaultApi('http://vault.example');
    const token = 'test-token';

    vaultApi.setToken(token);

    expect(vaultApi['token']).toBe(token);
  });

  it('should ensure that the authentication token is valid and client is authenticated', async () => {
    const vaultApi = new VaultApi(vaultContainer.url, vaultContainer.transitPath);
    vaultApi.setToken(vaultContainer.token);

    await expect(vaultApi.ensureAuthentication()).resolves.toBeUndefined();
  });

  it('should throw an error when authentication token is not valid', async () => {
    const vaultApi = new VaultApi(vaultContainer.url, vaultContainer.transitPath);
    vaultApi.setToken('random-token');

    await expect(vaultApi.ensureAuthentication()).rejects.toThrow();
  });

  describe('Login with username and password', () => {
    it('should login to the Vault using a username and password', async () => {
      const vaultApi = new VaultApi(vaultContainer.url, vaultContainer.transitPath);

      await expect(
        vaultApi.loginWithUsernameAndPassword(vaultContainer.username, vaultContainer.password)
      ).resolves.toBeUndefined();
      expect(vaultApi['token']).toBeDefined();
    });

    it('should throw an error when invalid credentials are used', async () => {
      const vaultApi = new VaultApi(vaultContainer.url, vaultContainer.transitPath);
      const username = 'wrong';
      const password = 'wrong';

      await expect(vaultApi.loginWithUsernameAndPassword(username, password)).rejects.toThrow();
      expect(vaultApi['token']).toBeUndefined();
    });
  });

  describe('Login with app role', () => {
    it('should login to the Vault using a role id and secret id', async () => {
      const vaultApi = new VaultApi(vaultContainer.url, vaultContainer.transitPath);

      await expect(vaultApi.loginWithAppRole(vaultContainer.roleId, vaultContainer.secretId)).resolves.toBeUndefined();
      expect(vaultApi['token']).toBeDefined();
    });

    it('should throw an error when invalid credentials are used', async () => {
      const vaultApi = new VaultApi(vaultContainer.url, vaultContainer.transitPath);
      const roleId = 'wrong';
      const secretId = 'wrong';

      await expect(vaultApi.loginWithAppRole(roleId, secretId)).rejects.toThrow();
      expect(vaultApi['token']).toBeUndefined();
    });
  });

  describe('Managing keys', () => {
    let vaultApi: VaultApi;
    const existingKey = 'key1';

    beforeAll(async () => {
      vaultApi = new VaultApi(vaultContainer.url, vaultContainer.transitPath);
      vaultApi.setToken(vaultContainer.token);

      await vaultApi.createKey(existingKey);
    });

    it('should create a new key', async () => {
      await expect(vaultApi.createKey('my-key')).resolves.toBeUndefined();

      const isValidKey = await vaultApi.validateKey('my-key');
      expect(isValidKey).toBe(true);
    });

    it('should not throw an error when creating a key that already exists', async () => {
      await expect(vaultApi.createKey(existingKey)).resolves.toBeUndefined();
    });

    it('should validate a key', async () => {
      const isValidKey = await vaultApi.validateKey(existingKey);
      expect(isValidKey).toBe(true);
    });

    it('should throw an error when validating a key that does not exist', async () => {
      await expect(vaultApi.validateKey('non-existent-key')).rejects.toThrow();
    });

    it('should throw an error when validating a key that does not support signing', async () => {
      const keyName = randomUUID();
      await vaultApi['_post'](`${vaultApi['transitPath']}/keys/${keyName}`, {
        type: 'aes128-gcm96',
      });

      await expect(vaultApi.validateKey(keyName)).resolves.toBe(false);
    });

    it('should throw an error when validating a key that is not of type ed25519', async () => {
      const keyName = randomUUID();
      await vaultApi['_post'](`${vaultApi['transitPath']}/keys/${keyName}`, {
        type: 'rsa-2048',
      });

      await expect(vaultApi.validateKey(keyName)).resolves.toBe(false);
    });

    it('should get the public key of a key pair', async () => {
      const publicKey = await vaultApi.getPublicKey(existingKey);

      expect(publicKey).toBeDefined();

      const publicKeyClass = PublicKey.fromStringED25519(publicKey);
      expect(publicKeyClass).toBeDefined();
    });
  });

  describe('Signing operation', () => {
    let vaultApi: VaultApi;

    const existingKey = 'key2';

    beforeAll(async () => {
      vaultApi = new VaultApi(vaultContainer.url, vaultContainer.transitPath);
      vaultApi.setToken(vaultContainer.token);

      await vaultApi.createKey(existingKey);
    });

    it('should sign a message using a key', async () => {
      const message = 'Hello, World!';
      const encodedMessage = Buffer.from(message).toString('base64');
      const signature = await vaultApi.sign(existingKey, encodedMessage);

      expect(signature).toBeDefined();
    });

    it('should throw an error when signing a message with a key that does not exist', async () => {
      const message = 'Hello, World!';

      await expect(vaultApi.sign('non-existent-key', message)).rejects.toThrow();
    });

    it('should verify the signature of a message', async () => {
      const message = 'Hello, World!';
      const encodedMessage = Buffer.from(message).toString('base64');

      const signature = await vaultApi.sign(existingKey, encodedMessage);

      const isValid = await vaultApi.verify(existingKey, encodedMessage, signature);

      expect(isValid).toBe(true);
    });

    it('should throw an error when verifying a signature with a key that does not exist', async () => {
      const message = 'Hello, World!';
      const encodedMessage = Buffer.from(message).toString('base64');
      const signature = 'random-signature';

      await expect(vaultApi.verify('non-existent-key', encodedMessage, signature)).rejects.toThrow();
    });

    it('should result with false when verifying invalid signature', async () => {
      const message = 'Hello, World!';
      const encodedMessage = Buffer.from(message).toString('base64');
      const signature = Buffer.from('random-signature').toString('base64');

      const isValid = await vaultApi.verify(existingKey, encodedMessage, signature);

      expect(isValid).toBe(false);
    });

    it('should verify the signature of a message with a public key', async () => {
      const message = 'Hello, World!';
      const encodedMessage = Buffer.from(message).toString('base64');

      const signature = await vaultApi.sign(existingKey, encodedMessage);
      const publicKey = await vaultApi.getPublicKey(existingKey);

      const verifier = PublicKey.fromStringED25519(publicKey);
      const isValid = verifier.verify(Buffer.from(encodedMessage, 'base64'), Buffer.from(signature, 'base64'));

      expect(isValid).toBe(true);
    });
  });

  describe('Parsing response', () => {
    it('should parse a successful response', async () => {
      const response = {
        json: () => Promise.resolve({ data: 'test' }),
      };

      const vaultApi = new VaultApi('http://vault.example');

      await expect(vaultApi['parseResponse'](response as Response)).resolves.toStrictEqual({
        data: 'test',
      });
    });

    it('should throw an error when parsing a failed response', async () => {
      const response = {
        json: () => Promise.resolve({ errors: ['test'] }),
      };

      const vaultApi = new VaultApi('http://vault.example');

      await expect(vaultApi['parseResponse'](response as Response)).rejects.toThrow();
    });
  });

  describe('Handling errors', () => {
    it('should rethrow a DIDError', () => {
      const vaultApi = new VaultApi('http://vault.example');

      const error = new DIDError('internalError', 'test');

      try {
        vaultApi['errorHandler'](error);
      } catch (e) {
        expect(e).toBe(error);
      }
    });

    it('should convert an Error to a DIDError', () => {
      const vaultApi = new VaultApi('http://vault.example');

      const error = new Error('test');

      try {
        vaultApi['errorHandler'](error);
      } catch (e) {
        expect(e).toBeInstanceOf(DIDError);
      }
    });

    it('should throw an unknown error', () => {
      const vaultApi = new VaultApi('http://vault.example');

      try {
        vaultApi['errorHandler']({
          message: 'error',
        });
      } catch (e: unknown) {
        const error = e as DIDError;
        expect(error).toBeInstanceOf(DIDError);
        expect(error.code).toBe('internalError');
        expect(error.message).toBe('Unknown error');
      }
    });
  });

  describe('HTTP methods', () => {
    it('should send a GET request', async () => {
      const vaultApi = new VaultApi('http://vault.example');
      vaultApi.setToken('test-token');

      global.fetch = jest.fn().mockResolvedValue({
        json: () => Promise.resolve({ data: 'test' }),
      });

      const response = await vaultApi['_get']('transit/keys');

      expect(response).toStrictEqual({ data: 'test' });
      expect(global.fetch).toHaveBeenCalledWith('http://vault.example/v1/transit/keys', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'X-Vault-Token': 'test-token',
        },
      });
    });

    it('should throw an error on error GET response', async () => {
      const vaultApi = new VaultApi('http://vault.example');
      vaultApi.setToken('test-token');

      global.fetch = jest.fn().mockResolvedValue({
        json: () => Promise.resolve({ errors: ['test'] }),
      });

      await expect(vaultApi['_get']('transit/keys')).rejects.toThrow();
    });

    it('should send a POST request', async () => {
      const vaultApi = new VaultApi('http://vault.example');
      vaultApi.setToken('test-token');

      global.fetch = jest.fn().mockResolvedValue({
        json: () => Promise.resolve({ data: 'test' }),
      });

      const response = await vaultApi['_post']('transit/keys', {
        property: 'test-body',
      });

      expect(response).toStrictEqual({ data: 'test' });
      expect(global.fetch).toHaveBeenCalledWith('http://vault.example/v1/transit/keys', {
        method: 'POST',
        body: JSON.stringify({ property: 'test-body' }),
        headers: {
          'Content-Type': 'application/json',
          'X-Vault-Token': 'test-token',
        },
      });
    });

    it('should throw an error on error POST response', async () => {
      const vaultApi = new VaultApi('http://vault.example');
      vaultApi.setToken('test-token');

      global.fetch = jest.fn().mockResolvedValue({
        json: () => Promise.resolve({ errors: ['test'] }),
      });

      await expect(vaultApi['_post']('transit/keys', { data: '' })).rejects.toThrow();
    });
  });
});
