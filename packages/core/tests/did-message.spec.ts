import { TestDIDMessage } from './helpers';

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

  it('should return proper payload of the message', () => {
    const messagePayload = {
      foo: 'bar',
    };
    const signature = new Uint8Array([1, 2, 3, 4]);

    message.messageMock.mockReturnValue(messagePayload);
    message.setSignature(signature);

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

    expect(() => message.payload).toThrow('Signature is missing');
  });

  it('should set the signature of the message', () => {
    const signature = new Uint8Array([1, 2, 3, 4]);

    message.setSignature(signature);

    expect(message.signature).toEqual(signature);
  });

  it('should sign the message with the given signer', async () => {
    const signature = new Uint8Array([1, 2, 3, 4]);
    const signer = {
      sign: jest.fn().mockResolvedValue(signature),
      publicKey: jest.fn(),
      verify: jest.fn(),
    };

    await message.signWith(signer);

    expect(signer.sign).toHaveBeenCalledWith(message.messageBytes);
    expect(message.signature).toEqual(signature);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });
});
