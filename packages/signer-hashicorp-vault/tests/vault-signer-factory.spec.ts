import { VaultSignerFactory } from '../src';
import { VaultApi } from '../src/vault-api';

const VaultApiMock = VaultApi as jest.MockedClass<typeof VaultApi>;

jest.mock('../src/vault-api.ts');

describe('Vault Signer Factory', () => {
  beforeEach(() => {
    VaultApiMock.mockClear();
  });

  it('should authenticated vault signer factory with token', async () => {
    const factory = await VaultSignerFactory.loginWithToken({
      token: 'test',
      url: 'http://example.com',
    });

    const mockApiInstance = VaultApiMock.mock.instances[0];

    expect(mockApiInstance.setToken).toHaveBeenCalledWith('test');
    expect(mockApiInstance.ensureAuthentication).toHaveBeenCalledTimes(1);
    expect(VaultApiMock).toHaveBeenCalledWith('http://example.com', undefined);
    expect(factory).toBeDefined();
    expect(factory).toBeInstanceOf(VaultSignerFactory);
  });

  it('should authenticated vault signer factory with token and custom transit path', async () => {
    await VaultSignerFactory.loginWithToken({
      token: 'test',
      url: 'http://example.com',
      transitPath: 'custom-path',
    });

    const mockApiInstance = VaultApiMock.mock.instances[0];

    expect(mockApiInstance.setToken).toHaveBeenCalledWith('test');
    expect(mockApiInstance.ensureAuthentication).toHaveBeenCalledTimes(1);
    expect(VaultApiMock).toHaveBeenCalledWith('http://example.com', 'custom-path');
  });

  it('should authenticated vault signer factory with username and password', async () => {
    const factory = await VaultSignerFactory.loginWithUsernameAndPassword({
      username: 'test',
      password: 'test',
      url: 'http://example.com',
    });

    const mockApiInstance = VaultApiMock.mock.instances[0];

    expect(mockApiInstance.loginWithUsernameAndPassword).toHaveBeenCalledWith('test', 'test');
    expect(VaultApiMock).toHaveBeenCalledWith('http://example.com', undefined);
    expect(factory).toBeDefined();
    expect(factory).toBeInstanceOf(VaultSignerFactory);
  });

  it('should authenticated vault signer factory with username and password and custom transit path', async () => {
    await VaultSignerFactory.loginWithUsernameAndPassword({
      username: 'test',
      password: 'test',
      url: 'http://example.com',
      transitPath: 'custom-path',
    });

    const mockApiInstance = VaultApiMock.mock.instances[0];

    expect(mockApiInstance.loginWithUsernameAndPassword).toHaveBeenCalledWith('test', 'test');
    expect(VaultApiMock).toHaveBeenCalledWith('http://example.com', 'custom-path');
  });

  it('should authenticated vault signer factory using app role', async () => {
    const factory = await VaultSignerFactory.loginWithAppRole({
      secretId: 'test',
      roleId: 'test',
      url: 'http://example.com',
    });

    const mockApiInstance = VaultApiMock.mock.instances[0];

    expect(mockApiInstance.loginWithAppRole).toHaveBeenCalledWith('test', 'test');
    expect(VaultApiMock).toHaveBeenCalledWith('http://example.com', undefined);
    expect(factory).toBeDefined();
    expect(factory).toBeInstanceOf(VaultSignerFactory);
  });

  it('should authenticated vault signer factory using app role with custom transit path', async () => {
    await VaultSignerFactory.loginWithAppRole({
      secretId: 'test',
      roleId: 'test',
      url: 'http://example.com',
      transitPath: 'custom-path',
    });

    const mockApiInstance = VaultApiMock.mock.instances[0];

    expect(mockApiInstance.loginWithAppRole).toHaveBeenCalledWith('test', 'test');
    expect(VaultApiMock).toHaveBeenCalledWith('http://example.com', 'custom-path');
  });

  describe('Authenticated Vault Signer Factory', () => {
    let factory: VaultSignerFactory;
    let client: jest.Mocked<VaultApi>;

    beforeEach(async () => {
      factory = await VaultSignerFactory.loginWithToken({
        token: 'test',
        url: 'http://example.com',
      });

      client = VaultApiMock.mock.instances[0] as jest.Mocked<VaultApi>;
    });

    it('should have vault api client set', () => {
      expect(factory['vaultApi']).toBe(client);
    });

    it('should create a new key and return a corresponding signer', async () => {
      const signer = await factory.forNewKey('test');

      expect(client.createKey).toHaveBeenCalledWith('test');
      expect(signer).toBeDefined();
      expect(signer['options'].clientApi).toBe(client);
      expect(signer['options'].keyName).toBe('test');
    });

    it('should get a signer from existing key', async () => {
      client.validateKey.mockResolvedValue(true);

      const signer = await factory.forKey('test');

      expect(client.validateKey).toHaveBeenCalledWith('test');
      expect(signer).toBeDefined();
      expect(signer['options'].clientApi).toBe(client);
      expect(signer['options'].keyName).toBe('test');
    });

    it('should throw error if key is invalid', async () => {
      client.validateKey.mockResolvedValue(false);

      await expect(factory.forKey('test')).rejects.toThrow();

      expect(client.validateKey).toHaveBeenCalledWith('test');
    });
  });
});
