import { DIDError, KeysUtility } from '@hiero-did-sdk/core';
import { parseTransitPath, parseUrl } from './utils';

/**
 * A class to interact with the Hashicorp Vault HTTP API.
 * The class provides methods to login, validate keys, get public keys, sign messages, and verify signatures.
 */
export class VaultApi {
  /**
   * The API version of the Hashicorp Vault server.
   */
  private readonly API_VERSION = 'v1';

  /**
   * The URL of the Hashicorp Vault server.
   */
  private readonly vaultUrl: URL;

  /**
   * The path to the transit engine in the Vault.
   */
  private transitPath: string;

  /**
   * The Vault authentication token.
   */
  private token: string;

  /**
   * Creates a new instance of the VaultApi class.
   * @param url The URL of the Hashicorp Vault server.
   */
  constructor(url: string | URL, transitPath = 'transit') {
    this.vaultUrl = parseUrl(url);
    this.transitPath = parseTransitPath(transitPath);
  }

  /**
   * Sets the authentication token for the Vault API client.
   * @param token The vault authentication token.
   * @returns The current instance of the VaultApi class.
   */
  setToken(token: string): VaultApi {
    this.token = token;

    return this;
  }

  /**
   * Ensures that the authentication token is valid and client is authenticated.
   * @throws Thrown if the authentication token is invalid.
   */
  async ensureAuthentication(): Promise<void> {
    const response = await this._get<{
      data: {
        accessor: string;
      };
    }>('auth/token/lookup-self');

    if (!response.data.accessor) {
      throw new DIDError('internalError', 'Vault authentication failed.');
    }
  }

  /**
   * Logs in to the Vault using a username and password. The login token is stored in the client.
   * @param username Vault username
   * @param password Vault password
   * @returns A promise that resolves when the login is successful.
   */
  async loginWithUsernameAndPassword(username: string, password: string): Promise<void> {
    const response = await this._post<{
      auth: {
        client_token: string;
      };
    }>(`auth/userpass/login/${username}`, {
      password,
    });

    const token = response.auth.client_token;
    this.setToken(token);
  }

  /**
   * Logs in to the Vault using an AppRole. The login token is stored in the client.
   * @param roleId The AppRole role ID.
   * @param secretId The AppRole secret ID.
   * @returns A promise that resolves when the login is successful.
   */
  async loginWithAppRole(roleId: string, secretId: string): Promise<void> {
    const response = await this._post<{
      auth: {
        client_token: string;
      };
    }>(`auth/approle/login`, {
      role_id: roleId,
      secret_id: secretId,
    });

    const token = response.auth.client_token;
    this.setToken(token);
  }

  /**
   * Validates the key with the specified name. Ensure that the key supports signing and is of type ed25519.
   * @param keyName The name of the key to validate.
   * @returns True if the key is valid, false otherwise.
   */
  async validateKey(keyName: string): Promise<boolean> {
    const response = await this._get<{
      data: {
        type: string;
        name: string;
        supports_encryption: boolean;
        supports_decryption: boolean;
        supports_derivation: boolean;
        supports_signing: boolean;
      };
    }>(`${this.transitPath}/keys/${keyName}`);

    const data = response.data;

    return data.supports_signing && data.type === 'ed25519';
  }

  /**
   * Creates a new key with the specified name.
   * @param keyName The name of the key to create.
   * @returns A promise that resolves when the key is created.
   */
  async createKey(keyName: string): Promise<void> {
    await this._post(`${this.transitPath}/keys/${keyName}`, {
      type: 'ed25519',
    });
  }

  /**
   * Gets the public key of the key with the specified name.
   * It returns the first version of the key.
   * @param keyName The name of the key to get the public key for.
   * @returns The public key in DER format.
   */
  async getPublicKey(keyName: string): Promise<string> {
    const response = await this._get<{
      data: {
        keys: Record<string, string>;
      };
    }>(`${this.transitPath}/export/public-key/${keyName}/1`);

    const derKey = KeysUtility.fromBase64(response.data.keys['1']).toDerString();

    return derKey;
  }

  /**
   * Signs the message with the key with the specified name.
   * @param keyName The name of the key to sign the message with.
   * @param message The message to sign.
   * @returns The signature of the message.
   */
  async sign(keyName: string, message: string): Promise<string> {
    const response = await this._post<{
      data: {
        signature: string;
      };
    }>(`${this.transitPath}/sign/${keyName}`, {
      input: message,
      key_version: 1,
    });

    return response.data.signature.slice('vault:vx:'.length);
  }

  /**
   * Verifies the signature of the message with the key with the specified name.
   * @param keyName The name of the key to verify the signature with.
   * @param message The message to verify in base64 format.
   * @param signature The signature to verify in base64 format.
   * @returns True if the signature is valid, false otherwise.
   */
  async verify(keyName: string, message: string, signature: string): Promise<boolean> {
    const response = await this._post<{
      data: {
        valid: boolean;
      };
    }>(`${this.transitPath}/verify/${keyName}`, {
      input: message,
      signature: `vault:v1:${signature}`,
    });

    return response ? response.data.valid : false;
  }

  private async _get<T>(path: string): Promise<T> {
    try {
      const response = await fetch(`${this.vaultUrl.href}${this.API_VERSION}/${path}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'X-Vault-Token': this.token,
        },
      });

      const parsedResponse = await this.parseResponse<T>(response);
      return parsedResponse;
    } catch (error: unknown) {
      this.errorHandler(error);
    }
  }

  private async _post<T>(path: string, body: object): Promise<T> {
    try {
      const response = await fetch(`${this.vaultUrl.href}${this.API_VERSION}/${path}`, {
        method: 'POST',
        body: JSON.stringify(body),
        headers: {
          'Content-Type': 'application/json',
          'X-Vault-Token': this.token,
        },
      });

      const parsedResponse = await this.parseResponse<T>(response);
      return parsedResponse;
    } catch (error: unknown) {
      this.errorHandler(error);
    }
  }

  private errorHandler(error: unknown): void {
    if (error instanceof DIDError) {
      throw error;
    }

    if (error instanceof Error) {
      throw new DIDError('internalError', `Vault API request failed: ${error.message}`);
    }

    throw new DIDError('internalError', 'Unknown error');
  }

  private async parseResponse<T>(response: Response): Promise<T> {
    const data: unknown = await response.json();

    if (typeof data === 'object' && 'errors' in data && Array.isArray(data.errors)) {
      throw new DIDError('internalError', `Vault API request failed: ${data.errors[0]}`);
    }

    return data as T;
  }
}
