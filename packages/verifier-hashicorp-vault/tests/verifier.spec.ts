import { Verifier } from '../src';
import { TestVaultApi } from './helpers';
import { Buffer } from 'buffer';

describe('Vault Verifier', () => {
  it('should create a Verifier with key name', () => {
    const verifier = new Verifier({
      clientApi: new TestVaultApi(),
      keyName: 'test-key',
    });

    expect(verifier).toBeDefined();
  });

  it('should get the public key from vault api', async () => {
    const clientApi = new TestVaultApi();
    const verifier = new Verifier({
      clientApi,
      keyName: 'test-key',
    });

    clientApi.getPublicKeyMock.mockResolvedValue('test-public-key');

    const publicKey = await verifier.publicKey();

    expect(publicKey).toBe('test-public-key');
    expect(clientApi.getPublicKeyMock).toHaveBeenCalledWith('test-key');
  });

  it('should verify a signature', async () => {
    const clientApi = new TestVaultApi();
    const verifier = new Verifier({
      clientApi,
      keyName: 'test-key',
    });

    clientApi.verifyMock.mockResolvedValue(true);

    const message = Buffer.from('test-message');
    const signature = Buffer.from('test-signature');

    const isValid = await verifier.verify(message, signature);

    expect(isValid).toBe(true);
    expect(clientApi.verifyMock).toHaveBeenCalledWith(
      'test-key',
      message.toString('base64'),
      signature.toString('base64')
    );
  });
});
