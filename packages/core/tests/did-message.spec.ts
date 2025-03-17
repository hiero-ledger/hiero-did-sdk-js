import { TestDIDMessage, TestVerifier } from './helpers';

describe('DID Message', () => {
  let message: TestDIDMessage;

  beforeEach(() => {
    message = new TestDIDMessage();
  });

  it('should return message as a JSON string in bytes', () => {
    const messagePayload = {
      foo: 'bar',
    };

    message.messageMock.mockReturnValue(messagePayload);
    const messageBytes = message.messageBytes;

    expect(messageBytes).toBeInstanceOf(Uint8Array);
    expect(messageBytes).toEqual(
      new TextEncoder().encode(JSON.stringify(messagePayload)),
    );
  });

  it('should return proper payload of the message', async () => {
    const messagePayload = {
      foo: 'bar',
    };
    const signature = new Uint8Array([1, 2, 3, 4]);
    const verifier = new TestVerifier();
    verifier.verifyMock.mockReturnValue(true);

    message.messageMock.mockReturnValue(messagePayload);
    await message.setSignature(signature, verifier);

    const payload = message.payload;

    expect(typeof payload).toBe('string');
    expect(JSON.parse(payload)).toMatchObject({
      message: messagePayload,
      signature: Buffer.from(signature).toString('base64'),
    });
  });

  it('should throw an error if signature is missing in payload', () => {
    const messagePayload = {
      foo: 'bar',
    };

    message.messageMock.mockReturnValue(messagePayload);

    expect(() => message.payload).toThrow(
      'DID message is missing a signature. Signature is required to construct a DID message payload.',
    );
  });

  it('should set the valid signature of the message', async () => {
    const signature = new Uint8Array([1, 2, 3, 4]);
    const verifier = new TestVerifier();
    verifier.verifyMock.mockReturnValue(true);

    await message.setSignature(signature, verifier);

    expect(message.signature).toEqual(signature);
  });

  it('should throw an error when invalid signature', async () => {
    const signature = new Uint8Array([1, 2, 3, 4]);
    const verifier = new TestVerifier();
    verifier.verifyMock.mockReturnValue(false);

    await expect(() =>
      message.setSignature(signature, verifier),
    ).rejects.toThrow('The signature is invalid');

    expect(message.signature).toBeUndefined();
  });

  it('should sign the message with the given signer', async () => {
    const signature = new Uint8Array([1, 2, 3, 4]);
    const signer = {
      sign: jest.fn().mockResolvedValue(signature),
      publicKey: jest.fn(),
      verify: jest.fn(),
    };
    const verifier = {
      publicKey: jest.fn(),
      verify: jest.fn().mockResolvedValue(true),
    };

    await message.signWith(signer, verifier);

    expect(signer.sign).toHaveBeenCalledWith(message.messageBytes);
    expect(message.signature).toEqual(signature);
  });

  it('should throw an error if the signer is invalid', async () => {
    const signature = new Uint8Array([1, 2, 3, 4]);
    const signer = {
      sign: jest.fn().mockResolvedValue(signature),
      publicKey: jest.fn(),
      verify: jest.fn(),
    };
    const verifier = {
      publicKey: jest.fn(),
      verify: jest.fn().mockResolvedValue(false),
    };

    await expect(() => message.signWith(signer, verifier)).rejects.toThrow(
      'The signature is invalid. Provided signer does not match the DID signer.',
    );

    expect(message.signature).toBeUndefined();
  });

  afterEach(() => {
    jest.clearAllMocks();
  });
});
