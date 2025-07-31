import { VaultApi } from './vault-api';

export interface VaultFactoryOptions {
  /**
   * The URL of the Hashicorp Vault server.
   */
  url: string | URL;

  /**
   * The path to the transit engine in the Vault.
   */
  transitPath?: string;
}

export interface VerifierOptions {
  /**
   * The Vault API client to interact with the Hashicorp Vault server.
   */
  clientApi: VaultApi;

  /**
   * The name of the key in the Vault.
   */
  keyName: string;
}

export interface VaultLoginWithTokenOptions extends VaultFactoryOptions {
  /**
   * The authentication token for the Vault API.
   */
  token: string;
}

export interface VaultLoginWithUsernameAndPasswordOptions extends VaultFactoryOptions {
  /**
   * The username to authenticate with.
   */
  username: string;

  /**
   * The password to authenticate
   */
  password: string;
}

export interface VaultLoginWithAppRoleOptions extends VaultFactoryOptions {
  /**
   * The role ID to authenticate with.
   */
  roleId: string;

  /**
   * The secret ID to authenticate with.
   */
  secretId: string;
}
