import { DIDError } from '@hiero-did-sdk/core';
import { Signer } from './signer';
import {
  VaultLoginWithAppRoleOptions,
  VaultLoginWithTokenOptions,
  VaultLoginWithUsernameAndPasswordOptions,
} from './interfaces';
import { VaultApi } from './vault-api';

/**
 * A factory class to create Signer instances for Hashicorp Vault.
 * Authentication to the Vault is done using a token, username and password, or AppRole.
 * The factory can be used to create Signer instances for existing keys or new keys.
 */
export class VaultSignerFactory {
  /**
   * Creates a new instance of the VaultSignerFactory class.
   * @param vaultApi A VaultApi instance to interact with the Hashicorp Vault server.
   */
  private constructor(private readonly vaultApi: VaultApi) {}

  /**
   * Creates a new Signer instance for an existing key.
   * @param keyName The name of the key in the Vault.
   * @returns A new Signer instance.
   *
   * @example
   * ```typescript
   * const factory = await VaultSignerFactory.loginWithAppRole({ ... });
   *
   * const signer = await factory.forKey('my-existing-key');
   * ```
   */
  async forKey(keyName: string): Promise<Signer> {
    const isValidKey = await this.vaultApi.validateKey(keyName);

    if (!isValidKey) {
      throw new DIDError('invalidArgument', 'Specified key does not exist or cannot be accessed.');
    }

    return new Signer({
      clientApi: this.vaultApi,
      keyName,
    });
  }

  /**
   * Creates a new key pair in the Vault and returns a Signer instance for the new key.
   * @param keyName The name of the new key to create.
   * @returns A new Signer instance.
   *
   * @example
   * ```typescript
   * const factory = await VaultSignerFactory.loginWithAppRole({ ... });
   *
   * const signer = await factory.forNewKey('my-new-key');
   * ```
   */
  async forNewKey(keyName: string): Promise<Signer> {
    await this.vaultApi.createKey(keyName);

    return new Signer({
      clientApi: this.vaultApi,
      keyName,
    });
  }

  /**
   * Logs in to the Hashicorp Vault using a token.
   * @param options The options to login to the Vault.
   * @returns A new instance of the VaultSignerFactory class.
   *
   * @example
   * ```typescript
   * const factory = await VaultSignerFactory.loginWithToken({
   *  url: 'http://localhost:8200',
   *  token: 'my-auth-token',
   * });
   *
   * const signer = await factory.forNewKey('my-key');
   * ```
   */
  static async loginWithToken(options: VaultLoginWithTokenOptions): Promise<VaultSignerFactory> {
    const vaultApi = new VaultApi(options.url, options.transitPath);
    vaultApi.setToken(options.token);

    await vaultApi.ensureAuthentication();

    return new VaultSignerFactory(vaultApi);
  }

  /**
   * Logs in to the Hashicorp Vault using a username and password.
   * @param options The options to login to the Vault.
   * @returns A new instance of the VaultSignerFactory class.
   *
   * @example
   * ```typescript
   * const factory = await VaultSignerFactory.loginWithUsernameAndPassword({
   *  url: 'http://localhost:8200',
   *  username: 'my-username',
   *  password: 'my-password',
   * });
   *
   * const signer = await factory.forNewKey('my-key');
   * ```
   */
  static async loginWithUsernameAndPassword(
    options: VaultLoginWithUsernameAndPasswordOptions
  ): Promise<VaultSignerFactory> {
    const vaultApi = new VaultApi(options.url, options.transitPath);

    await vaultApi.loginWithUsernameAndPassword(options.username, options.password);

    return new VaultSignerFactory(vaultApi);
  }

  /**
   * Logs in to the Hashicorp Vault using an AppRole.
   * @param options The options to login to the Vault.
   * @returns A new instance of the VaultSignerFactory class.
   *
   * @example
   * ```typescript
   * const factory = await VaultSignerFactory.loginWithAppRole({
   *  url: 'http://localhost:8200',
   *  roleId: 'my-role-id',
   *  secretId: 'my-secret-id',
   * });
   *
   * const signer = await factory.forNewKey('my-key');
   * ```
   */
  static async loginWithAppRole(options: VaultLoginWithAppRoleOptions): Promise<VaultSignerFactory> {
    const vaultApi = new VaultApi(options.url, options.transitPath);

    await vaultApi.loginWithAppRole(options.roleId, options.secretId);

    return new VaultSignerFactory(vaultApi);
  }
}
