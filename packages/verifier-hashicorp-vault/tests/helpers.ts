import { randomUUID } from 'crypto';
import { GenericContainer, StartedTestContainer } from 'testcontainers';
import { VaultApi } from '../src/vault-api';

export class VaultTestContainer {
  private static IMAGE = 'hashicorp/vault:latest';
  private static PORT = 8200;

  private container: StartedTestContainer;
  public username = 'example-user';
  public password = randomUUID();
  public roleId: string;
  public secretId: string;

  constructor(
    public readonly token: string = randomUUID(),
    public readonly transitPath: string = 'transit'
  ) {}

  get url() {
    return `http://${this.container.getHost()}:${this.container.getMappedPort(VaultTestContainer.PORT)}/`;
  }

  async start() {
    const vaultContainer = await new GenericContainer(VaultTestContainer.IMAGE)
      .withAddedCapabilities('IPC_LOCK')
      .withEnvironment({
        VAULT_DEV_ROOT_TOKEN_ID: this.token,
        VAULT_DEV_LISTEN_ADDRESS: `0.0.0.0:${VaultTestContainer.PORT}`,
      })
      .withExposedPorts(VaultTestContainer.PORT)
      .start();

    this.container = vaultContainer;

    return this;
  }

  async initialize() {
    const policy = 'app-policy';
    const appRole = 'my-app-role';

    // 1. Enable Transit Engine
    await this.execCommand('vault secrets enable transit');
    await this.execCommand('vault write -f transit/keys/my-encryption-key');

    // 2. Enable AppRole Auth Method
    await this.execCommand('vault auth enable approle');

    // Create an example AppRole
    await this.execCommand(`
        vault write auth/approle/role/${appRole} \
          secret_id_ttl=1h \
          token_ttl=1h \
          token_policies=default,${policy}
      `);

    // // Generate role-id and secret-id
    const roleIdOutput = await this.execCommand(`vault read auth/approle/role/${appRole}/role-id`);
    const secretIdOutput = await this.execCommand(`vault write -f auth/approle/role/${appRole}/secret-id`);

    this.roleId = roleIdOutput.match(/role_id\s+(.+)/)[1];
    this.secretId = secretIdOutput.match(/secret_id\s+(.+)/)[1];

    // 3. Enable Username & Password Auth Method
    await this.execCommand('vault auth enable userpass');

    // Create an example user
    await this.execCommand(`
        vault write auth/userpass/users/${this.username} \
          password="${this.password}" \
          policies="default,${policy}"
      `);

    // 4. Update policy
    await this.execCommand(`
      vault policy write ${policy} -<<EOF
      path "transit/*" {
        capabilities = ["create", "update"]
      }
      path "transit/*" {
        capabilities = ["create", "update"]
      }
EOF
    `);
  }

  async stop() {
    await this.container.stop();
  }

  private async execCommand(command: string) {
    const stream = await this.container.exec([
      'sh',
      '-c',
      `export VAULT_TOKEN=${this.token} && export VAULT_ADDR=http://localhost:8200 && ${command}`,
    ]);
    const output = stream.output.toString();

    return output;
  }
}

export class TestVaultApi extends VaultApi {
  public setTokenMock = jest.fn();
  public ensureAuthenticationMock = jest.fn();
  public loginWithUsernameAndPasswordMock = jest.fn();
  public loginWithAppRoleMock = jest.fn();
  public validateKeyMock = jest.fn();
  public createKeyMock = jest.fn();
  public getPublicKeyMock = jest.fn();
  public signMock = jest.fn();
  public verifyMock = jest.fn();

  constructor() {
    super('http://example.com');
  }

  setToken(token: string): TestVaultApi {
    this.signMock(token);
    return this;
  }

  async ensureAuthentication(): Promise<void> {
    (await this.ensureAuthenticationMock()) as never;
  }

  async loginWithUsernameAndPassword(username: string, password: string): Promise<void> {
    (await this.loginWithUsernameAndPasswordMock(username, password)) as never;
  }

  async loginWithAppRole(roleId: string, secretId: string): Promise<void> {
    (await this.loginWithAppRoleMock(roleId, secretId)) as never;
  }

  async validateKey(keyName: string): Promise<boolean> {
    return (await this.validateKeyMock(keyName)) as never;
  }

  async createKey(keyName: string): Promise<void> {
    return (await this.createKeyMock(keyName)) as never;
  }

  async getPublicKey(keyName: string): Promise<string> {
    return (await this.getPublicKeyMock(keyName)) as never;
  }

  async sign(keyName: string, message: string): Promise<string> {
    return (await this.signMock(keyName, message)) as never;
  }

  async verify(keyName: string, message: string, signature: string): Promise<boolean> {
    return (await this.verifyMock(keyName, message, signature)) as never;
  }
}
