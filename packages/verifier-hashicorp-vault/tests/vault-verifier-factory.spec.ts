import { VaultVerifierFactory } from '../src';
import { VaultApi } from '../src/vault-api';

const VaultApiMock = VaultApi as jest.MockedClass<typeof VaultApi>;

jest.mock('../src/vault-api.ts');

describe('Vault Verifier Factory', () => {
  beforeEach(() => {
    VaultApiMock.mockClear();
  });

  it('should authenticated vault verifier factory with token', async () => {
    const factory = await VaultVerifierFactory.loginWithToken({
      token: 'test',
      url: 'http://example.com',
    });

    const mockApiInstance = VaultApiMock.mock.instances[0];

    expect(mockApiInstance.setToken).toHaveBeenCalledWith('test');
    expect(mockApiInstance.ensureAuthentication).toHaveBeenCalledTimes(1);
    expect(VaultApiMock).toHaveBeenCalledWith('http://example.com', undefined);
    expect(factory).toBeDefined();
    expect(factory).toBeInstanceOf(VaultVerifierFactory);
  });

  it('should authenticated vault verifier factory with token and custom transit path', async () => {
    await VaultVerifierFactory.loginWithToken({
      token: 'test',
      url: 'http://example.com',
      transitPath: 'custom-path',
    });

    const mockApiInstance = VaultApiMock.mock.instances[0];

    expect(mockApiInstance.setToken).toHaveBeenCalledWith('test');
    expect(mockApiInstance.ensureAuthentication).toHaveBeenCalledTimes(1);
    expect(VaultApiMock).toHaveBeenCalledWith('http://example.com', 'custom-path');
  });

  it('should authenticated vault verifier factory with username and password', async () => {
    const factory = await VaultVerifierFactory.loginWithUsernameAndPassword({
      username: 'test',
      password: 'test',
      url: 'http://example.com',
    });

    const mockApiInstance = VaultApiMock.mock.instances[0];

    expect(mockApiInstance.loginWithUsernameAndPassword).toHaveBeenCalledWith('test', 'test');
    expect(VaultApiMock).toHaveBeenCalledWith('http://example.com', undefined);
    expect(factory).toBeDefined();
    expect(factory).toBeInstanceOf(VaultVerifierFactory);
  });

  it('should authenticated vault verifier factory with username and password and custom transit path', async () => {
    await VaultVerifierFactory.loginWithUsernameAndPassword({
      username: 'test',
      password: 'test',
      url: 'http://example.com',
      transitPath: 'custom-path',
    });

    const mockApiInstance = VaultApiMock.mock.instances[0];

    expect(mockApiInstance.loginWithUsernameAndPassword).toHaveBeenCalledWith('test', 'test');
    expect(VaultApiMock).toHaveBeenCalledWith('http://example.com', 'custom-path');
  });

  it('should authenticated vault verifier factory using app role', async () => {
    const factory = await VaultVerifierFactory.loginWithAppRole({
      secretId: 'test',
      roleId: 'test',
      url: 'http://example.com',
    });

    const mockApiInstance = VaultApiMock.mock.instances[0];

    expect(mockApiInstance.loginWithAppRole).toHaveBeenCalledWith('test', 'test');
    expect(VaultApiMock).toHaveBeenCalledWith('http://example.com', undefined);
    expect(factory).toBeDefined();
    expect(factory).toBeInstanceOf(VaultVerifierFactory);
  });

  it('should authenticated vault verifier factory using app role with custom transit path', async () => {
    await VaultVerifierFactory.loginWithAppRole({
      secretId: 'test',
      roleId: 'test',
      url: 'http://example.com',
      transitPath: 'custom-path',
    });

    const mockApiInstance = VaultApiMock.mock.instances[0];

    expect(mockApiInstance.loginWithAppRole).toHaveBeenCalledWith('test', 'test');
    expect(VaultApiMock).toHaveBeenCalledWith('http://example.com', 'custom-path');
  });

  describe('Authenticated Vault Verifier Factory', () => {
    let factory: VaultVerifierFactory;
    let client: jest.Mocked<VaultApi>;

    beforeEach(async () => {
      factory = await VaultVerifierFactory.loginWithToken({
        token: 'test',
        url: 'http://example.com',
      });

      client = VaultApiMock.mock.instances[0] as jest.Mocked<VaultApi>;
    });

    it('should have vault api client set', () => {
      expect(factory['vaultApi']).toBe(client);
    });

    it('should get a verifier from existing key', async () => {
      client.validateKey.mockResolvedValue(true);

      const verifier = await factory.forKey('test');

      expect(client.validateKey).toHaveBeenCalledWith('test');
      expect(verifier).toBeDefined();
      expect(verifier['options'].clientApi).toBe(client);
      expect(verifier['options'].keyName).toBe('test');
    });

    it('should throw error if key is invalid', async () => {
      client.validateKey.mockResolvedValue(false);

      await expect(factory.forKey('test')).rejects.toThrow();

      expect(client.validateKey).toHaveBeenCalledWith('test');
    });
  });
});
