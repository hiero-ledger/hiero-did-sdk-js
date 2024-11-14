import { InternalPublisher } from '@hashgraph-did-sdk/publisher-internal';
import { InternalSigner } from '@hashgraph-did-sdk/signer-internal';
import { LifecycleRunner, LifecycleBuilder } from '../src';
import { randomClient } from './helpers';

describe('Lifecycle runner class', () => {
  let publisher: InternalPublisher;

  beforeAll(() => {
    publisher = new InternalPublisher(randomClient());
  });

  afterAll(() => {
    publisher.client.close();
  });

  it('should be able to create a new instance', () => {
    const builder = new LifecycleBuilder();
    const runner = new LifecycleRunner(builder);

    expect(runner).toBeInstanceOf(LifecycleRunner);
  });

  describe('processing a message', () => {
    it('should be able to process callback step', async () => {
      const builder = new LifecycleBuilder();
      const runner = new LifecycleRunner(builder);

      const callbackFunction = jest.fn();
      builder.callback(callbackFunction);

      const state = await runner.process({} as never, {
        publisher,
      });

      expect(callbackFunction).toHaveBeenCalledTimes(1);
      expect(callbackFunction).toHaveBeenCalledWith({}, publisher);
      expect(state).toBeDefined();
      expect(state.status).toBe('success');
    });

    it('should be able to process sign step', async () => {
      const builder = new LifecycleBuilder();
      const runner = new LifecycleRunner(builder);

      builder.signWithSigner();

      const signer = InternalSigner.generate();

      const signWithMock = jest.fn();

      const state = await runner.process(
        {
          signWith: signWithMock,
        } as never,
        {
          publisher,
          signer: signer,
        },
      );

      expect(signWithMock).toHaveBeenCalledTimes(1);
      expect(signWithMock).toHaveBeenCalledWith(signer);
      expect(state).toBeDefined();
      expect(state.status).toBe('success');
    });

    it('should throw an error when signer is missing during sign step processing', async () => {
      const builder = new LifecycleBuilder();
      const runner = new LifecycleRunner(builder);

      builder.signWithSigner();

      await expect(
        runner.process({} as never, {
          publisher,
        }),
      ).rejects.toThrow('Signer is missing, but required.');
    });

    it('should be able to process signature step', async () => {
      const builder = new LifecycleBuilder();
      const runner = new LifecycleRunner(builder);

      builder.signature();

      const setSignatureMock = jest.fn();
      const signature = Buffer.from('signature');

      const state = await runner.process(
        {
          setSignature: setSignatureMock,
        } as never,
        {
          publisher,
          args: {
            signature,
          },
        },
      );

      expect(setSignatureMock).toHaveBeenCalledTimes(1);
      expect(setSignatureMock).toHaveBeenCalledWith(signature);
      expect(state).toBeDefined();
      expect(state.status).toBe('success');
    });

    it('should throw an error when signature is missing during signature step processing', async () => {
      const builder = new LifecycleBuilder();
      const runner = new LifecycleRunner(builder);

      builder.signature();

      const setSignatureMock = jest.fn();

      await expect(
        runner.process(
          {
            setSignature: setSignatureMock,
          } as never,
          {
            publisher,
          },
        ),
      ).rejects.toThrow('Signature is missing, but required.');
    });

    it('should be able to process pause step', async () => {
      const builder = new LifecycleBuilder();
      const runner = new LifecycleRunner(builder);

      builder.pause();

      const state = await runner.process({} as never, {
        publisher,
      });

      expect(state).toBeDefined();
      expect(state.status).toBe('pause');
      expect(state.step).toBe(0);
    });

    it('should return proper state when processing is successful', async () => {
      const builder = new LifecycleBuilder();
      const runner = new LifecycleRunner(builder);

      const state = await runner.process({} as never, {
        publisher,
      });

      expect(state).toBeDefined();
      expect(state.status).toBe('success');
      expect(state.step).toBe(-1);
      expect(state.message).toBeDefined();
    });

    it('should properly handle errors during processing with catch step', async () => {
      const builder = new LifecycleBuilder();
      const runner = new LifecycleRunner(builder);

      const catchCallback = jest.fn();

      const error = new Error('error');

      builder
        .callback(() => {
          throw error;
        })
        .catch(catchCallback);

      const state = await runner.process({} as never, {
        publisher,
      });

      expect(catchCallback).toHaveBeenCalledTimes(1);
      expect(catchCallback).toHaveBeenCalledWith(error);
      expect(state).toBeDefined();
      expect(state.status).toBe('error');
      expect(state.step).toBe(-1);
    });

    it('should throw an error when error occurred during processing without a catch step', async () => {
      const builder = new LifecycleBuilder();
      const runner = new LifecycleRunner(builder);

      const error = new Error('error');

      builder.callback(() => {
        throw error;
      });

      await expect(
        runner.process({} as never, {
          publisher,
        }),
      ).rejects.toThrow(error);
    });
  });

  it('should be able to resume a paused process', async () => {
    const builder = new LifecycleBuilder();
    const runner = new LifecycleRunner(builder);

    const step1Callback = jest.fn();
    const step2Callback = jest.fn();

    builder.callback(step1Callback).pause().callback(step2Callback);

    const state = await runner.process({} as never, {
      publisher,
    });

    expect(state).toBeDefined();
    expect(state.status).toBe('pause');
    expect(state.step).toBe(1);
    expect(step1Callback).toHaveBeenCalled();

    const resumedState = await runner.resume(state, {
      publisher,
    });

    expect(resumedState).toBeDefined();
    expect(resumedState.status).toBe('success');
    expect(step2Callback).toHaveBeenCalled();

    expect(step1Callback).toHaveBeenCalledTimes(1);
    expect(step2Callback).toHaveBeenCalledTimes(1);
  });

  it('should be able to resume a paused process from first step', async () => {
    const builder = new LifecycleBuilder();
    const runner = new LifecycleRunner(builder);

    const step1Callback = jest.fn();
    const step2Callback = jest.fn();

    builder.pause().callback(step1Callback).callback(step2Callback);

    const state = await runner.process({} as never, {
      publisher,
    });

    expect(state).toBeDefined();
    expect(state.status).toBe('pause');
    expect(state.step).toBe(0);

    const resumedState = await runner.resume(state, {
      publisher,
    });

    expect(resumedState).toBeDefined();
    expect(resumedState.status).toBe('success');

    expect(step1Callback).toHaveBeenCalledTimes(1);
    expect(step2Callback).toHaveBeenCalledTimes(1);
  });
});
