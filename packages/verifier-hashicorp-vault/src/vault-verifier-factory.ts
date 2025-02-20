import { DIDError } from '@swiss-digital-assets-institute/core';
import { Verifier } from './verifier';
import {
  VaultLoginWithAppRoleOptions,
  VaultLoginWithTokenOptions,
  VaultLoginWithUsernameAndPasswordOptions,
} from './interfaces';
import { VaultApi } from './vault-api';

/**
 * A factory class to create Verifier instances for Hashicorp Vault.
 * Authentication to the Vault is done using a token, username and password, or AppRole.
 * The factory can be used to create Verifier instances for existing keys.
 */
export class VaultVerifierFactory {
  /**
   * Creates a new instance of the VaultVerifierFactory class.
   * @param vaultApi A VaultApi instance to interact with the Hashicorp Vault server.
   */
  private constructor(private readonly vaultApi: VaultApi) {}

  /**
   * Creates a new Verifier instance for an existing key.
   * @param keyName The name of the key in the Vault.
   * @returns A new Verifier instance.
   *
   * @example
   * ```typescript
   * const factory = await VaultVerifierFactory.loginWithAppRole({ ... });
   *
   * const verifier = await factory.forKey('my-existing-key');
   * ```
   */
  async forKey(keyName: string): Promise<Verifier> {
    const isValidKey = await this.vaultApi.validateKey(keyName);

    if (!isValidKey) {
      throw new DIDError(
        'invalidArgument',
        'Specified key does not exist or cannot be accessed.',
      );
    }

    return new Verifier({
      clientApi: this.vaultApi,
      keyName,
    });
  }

  /**
   * Logs in to the Hashicorp Vault using a token.
   * @param options The options to login to the Vault.
   * @returns A new instance of the VaultVerifierFactory class.
   *
   * @example
   * ```typescript
   * const factory = await VaultVerifierFactory.loginWithToken({
   *  url: 'http://localhost:8200',
   *  token: 'my-auth-token',
   * });
   *
   * const verifier = await factory.forKey('my-key');
   * ```
   */
  static async loginWithToken(
    options: VaultLoginWithTokenOptions,
  ): Promise<VaultVerifierFactory> {
    const vaultApi = new VaultApi(options.url, options.transitPath);
    vaultApi.setToken(options.token);

    await vaultApi.ensureAuthentication();

    return new VaultVerifierFactory(vaultApi);
  }

  /**
   * Logs in to the Hashicorp Vault using a username and password.
   * @param options The options to login to the Vault.
   * @returns A new instance of the VaultVerifierFactory class.
   *
   * @example
   * ```typescript
   * const factory = await VaultVerifierFactory.loginWithUsernameAndPassword({
   *  url: 'http://localhost:8200',
   *  username: 'my-username',
   *  password: 'my-password',
   * });
   *
   * const verifier = await factory.forKey('my-key');
   * ```
   */
  static async loginWithUsernameAndPassword(
    options: VaultLoginWithUsernameAndPasswordOptions,
  ): Promise<VaultVerifierFactory> {
    const vaultApi = new VaultApi(options.url, options.transitPath);

    await vaultApi.loginWithUsernameAndPassword(
      options.username,
      options.password,
    );

    return new VaultVerifierFactory(vaultApi);
  }

  /**
   * Logs in to the Hashicorp Vault using an AppRole.
   * @param options The options to login to the Vault.
   * @returns A new instance of the VaultVerifierFactory class.
   *
   * @example
   * ```typescript
   * const factory = await VaultVerifierFactory.loginWithAppRole({
   *  url: 'http://localhost:8200',
   *  roleId: 'my-role-id',
   *  secretId: 'my-secret-id',
   * });
   *
   * const verifier = await factory.forKey('my-key');
   * ```
   */
  static async loginWithAppRole(
    options: VaultLoginWithAppRoleOptions,
  ): Promise<VaultVerifierFactory> {
    const vaultApi = new VaultApi(options.url, options.transitPath);

    await vaultApi.loginWithAppRole(options.roleId, options.secretId);

    return new VaultVerifierFactory(vaultApi);
  }
}
