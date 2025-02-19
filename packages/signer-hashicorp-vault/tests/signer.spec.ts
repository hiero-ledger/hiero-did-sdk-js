import { Signer } from '../src';
import { TestVaultApi } from './helpers';

describe('Vault Signer', () => {
  it('should create a Signer with key name', () => {
    const signer = new Signer({
      clientApi: new TestVaultApi(),
      keyName: 'test-key',
    });

    expect(signer).toBeDefined();
  });

  it('should get the public key from vault api', async () => {
    const clientApi = new TestVaultApi();
    const signer = new Signer({
      clientApi,
      keyName: 'test-key',
    });

    clientApi.getPublicKeyMock.mockResolvedValue('test-public-key');

    const publicKey = await signer.publicKey();

    expect(publicKey).toBe('test-public-key');
    expect(clientApi.getPublicKeyMock).toHaveBeenCalledWith('test-key');
  });

  it('should sign a message', async () => {
    const clientApi = new TestVaultApi();
    const signer = new Signer({
      clientApi,
      keyName: 'test-key',
    });

    const signature = Buffer.from('test-signature');
    clientApi.signMock.mockResolvedValue(signature.toString('base64'));

    const message = Buffer.from('test-message');
    const receivedSignature = await signer.sign(message);

    expect(receivedSignature).toEqual(signature);
    expect(clientApi.signMock).toHaveBeenCalledWith(
      'test-key',
      message.toString('base64'),
    );
  });

  it('should verify a signature', async () => {
    const clientApi = new TestVaultApi();
    const signer = new Signer({
      clientApi,
      keyName: 'test-key',
    });

    clientApi.verifyMock.mockResolvedValue(true);

    const message = Buffer.from('test-message');
    const signature = Buffer.from('test-signature');

    const isValid = await signer.verify(message, signature);

    expect(isValid).toBe(true);
    expect(clientApi.verifyMock).toHaveBeenCalledWith(
      'test-key',
      message.toString('base64'),
      signature.toString('base64'),
    );
  });
});
