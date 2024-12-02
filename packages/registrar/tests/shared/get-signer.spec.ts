import { PrivateKey } from '@hashgraph/sdk';
import { Signer } from '@swiss-digital-assets-institute/signer-internal';
import { getSigner } from '../../src/shared/get-signer';
import { TestSigner } from '../helpers';

describe('Get signer from providers', () => {
  it('should return Signer instance if provided', () => {
    const signer = new TestSigner();
    expect(getSigner(signer)).toBe(signer);
  });

  it('should return InternalSigner instance if private key is provided', async () => {
    const privateKey = await PrivateKey.generateED25519Async();

    const signer = getSigner(undefined, privateKey);
    expect(signer).toBeInstanceOf(Signer);
    expect(signer.publicKey()).toBe(privateKey.publicKey.toStringDer());
  });

  it('should throw error if no signer or private key is provided', () => {
    expect(() => getSigner()).toThrow('Missing signer or private key');
  });

  it('should create new InternalSigner instance with random private key when autoCreate option is enabled', () => {
    const signer = getSigner(undefined, undefined, true);
    expect(signer).toBeInstanceOf(Signer);
  });
});
