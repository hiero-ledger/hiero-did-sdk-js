import { Publisher } from '@swiss-digital-assets-institute/publisher-internal';
import { Signer } from '@swiss-digital-assets-institute/signer-internal';
import { LifecycleRunner, LifecycleBuilder } from '../src';
import { randomClient } from './helpers';

describe('Lifecycle runner class', () => {
  let publisher: Publisher;

  beforeAll(() => {
    publisher = new Publisher(randomClient());
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
      builder.callback('s1', callbackFunction);

      const state = await runner.process({} as never, {
        publisher,
      });

      expect(callbackFunction).toHaveBeenCalledTimes(1);
      expect(callbackFunction).toHaveBeenCalledWith({}, publisher, undefined);
      expect(state).toBeDefined();
      expect(state.status).toBe('success');
    });

    it('should be able to process callback step with context', async () => {
      const builder = new LifecycleBuilder();
      const runner = new LifecycleRunner(builder);

      const callbackFunction = jest.fn();
      builder.callback('s1', callbackFunction);

      const context = {
        foo: 'bar',
      };

      const state = await runner.process({} as never, {
        publisher,
        context,
      });

      expect(callbackFunction).toHaveBeenCalledTimes(1);
      expect(callbackFunction).toHaveBeenCalledWith({}, publisher, context);
      expect(state).toBeDefined();
      expect(state.status).toBe('success');
    });

    it('should be able to process sign step', async () => {
      const builder = new LifecycleBuilder();
      const runner = new LifecycleRunner(builder);

      builder.signWithSigner('s1');

      const signer = Signer.generate();

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

      builder.signWithSigner('s1');

      await expect(
        runner.process({} as never, {
          publisher,
        }),
      ).rejects.toThrow('Signer is missing, but required');
    });

    it('should be able to process signature step', async () => {
      const builder = new LifecycleBuilder();
      const runner = new LifecycleRunner(builder);

      builder.signature('s1');

      const setSignatureMock = jest.fn();
      const signature = Buffer.from('signature');
      const verifier = {
        verify: () => true,
      } as never;

      const state = await runner.process(
        {
          setSignature: setSignatureMock,
        } as never,
        {
          publisher,
          args: {
            signature,
            verifier,
          },
        },
      );

      expect(setSignatureMock).toHaveBeenCalledTimes(1);
      expect(setSignatureMock).toHaveBeenCalledWith(signature, verifier);
      expect(state).toBeDefined();
      expect(state.status).toBe('success');
    });

    it('should throw an error when signature is missing during signature step processing', async () => {
      const builder = new LifecycleBuilder();
      const runner = new LifecycleRunner(builder);

      builder.signature('s1');

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
      ).rejects.toThrow(
        'Signature and verifier are required for the signature step',
      );
    });

    it('should be able to process pause step', async () => {
      const builder = new LifecycleBuilder();
      const runner = new LifecycleRunner(builder);

      builder.pause('s1');

      const state = await runner.process({} as never, {
        publisher,
      });

      expect(state).toBeDefined();
      expect(state.status).toBe('pause');
      expect(state.index).toBe(0);
      expect(state.label).toBe('s1');
    });

    it('should return proper state when processing is successful', async () => {
      const builder = new LifecycleBuilder();
      const runner = new LifecycleRunner(builder);

      const state = await runner.process({} as never, {
        publisher,
      });

      expect(state).toBeDefined();
      expect(state.status).toBe('success');
      expect(state.index).toBe(-1);
      expect(state.message).toBeDefined();
    });

    it('should properly handle errors during processing with catch step', async () => {
      const builder = new LifecycleBuilder();
      const runner = new LifecycleRunner(builder);

      const catchCallback = jest.fn();

      const error = new Error('error');

      builder
        .callback('s1', () => {
          throw error;
        })
        .catch('s2', catchCallback);

      const state = await runner.process({} as never, {
        publisher,
      });

      expect(catchCallback).toHaveBeenCalledTimes(1);
      expect(catchCallback).toHaveBeenCalledWith(error);
      expect(state).toBeDefined();
      expect(state.status).toBe('error');
      expect(state.index).toBe(-1);
      expect(state.label).toBe('');
    });

    it('should throw an error when error occurred during processing without a catch step', async () => {
      const builder = new LifecycleBuilder();
      const runner = new LifecycleRunner(builder);

      const error = new Error('error');

      builder.callback('s1', () => {
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

    builder
      .callback('s1', step1Callback)
      .pause('s2')
      .callback('s3', step2Callback);

    const state = await runner.process({} as never, {
      publisher,
    });

    expect(state).toBeDefined();
    expect(state.status).toBe('pause');
    expect(state.index).toBe(1);
    expect(state.label).toBe('s2');
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

  it('should be able to resume a paused process with context', async () => {
    const builder = new LifecycleBuilder();
    const runner = new LifecycleRunner(builder);

    const step1Callback = jest.fn();
    const step2Callback = jest.fn();

    builder
      .callback('s1', step1Callback)
      .pause('s2')
      .callback('s3', step2Callback);

    const context = {
      foo: 'bar',
    };

    const state = await runner.process({} as never, {
      publisher,
      context,
    });

    expect(state).toBeDefined();
    expect(state.status).toBe('pause');
    expect(state.index).toBe(1);
    expect(state.label).toBe('s2');
    expect(step1Callback).toHaveBeenCalled();

    const resumedState = await runner.resume(state, {
      publisher,
      context,
    });

    expect(resumedState).toBeDefined();
    expect(resumedState.status).toBe('success');
    expect(step2Callback).toHaveBeenCalled();

    expect(step1Callback).toHaveBeenCalledTimes(1);
    expect(step2Callback).toHaveBeenCalledTimes(1);

    expect(step2Callback).toHaveBeenCalledWith({}, publisher, context);
  });

  it('should be able to resume a paused process from first step', async () => {
    const builder = new LifecycleBuilder();
    const runner = new LifecycleRunner(builder);

    const step1Callback = jest.fn();
    const step2Callback = jest.fn();

    builder
      .pause('s1')
      .callback('s2', step1Callback)
      .callback('s3', step2Callback);

    const state = await runner.process({} as never, {
      publisher,
    });

    expect(state).toBeDefined();
    expect(state.status).toBe('pause');
    expect(state.index).toBe(0);
    expect(state.label).toBe('s1');

    const resumedState = await runner.resume(state, {
      publisher,
    });

    expect(resumedState).toBeDefined();
    expect(resumedState.status).toBe('success');

    expect(step1Callback).toHaveBeenCalledTimes(1);
    expect(step2Callback).toHaveBeenCalledTimes(1);
  });

  it('should call a hook when steps is completed', async () => {
    const builder = new LifecycleBuilder();
    const runner = new LifecycleRunner(builder);

    const callbackFunction = jest.fn();
    const hookFunction = jest.fn();

    builder.callback('s1', callbackFunction).callback('s2', callbackFunction);

    runner.onComplete('s1', hookFunction);

    await runner.process({} as never, {
      publisher,
    });

    expect(hookFunction).toHaveBeenCalledTimes(1);

    expect(callbackFunction.mock.invocationCallOrder[0]).toBeLessThan(
      hookFunction.mock.invocationCallOrder[0],
    );
  });

  it('should call a hook with pause step in correct order', async () => {
    const builder = new LifecycleBuilder();
    const runner = new LifecycleRunner(builder);

    const callbackFunction = jest.fn();
    const hookFunction = jest.fn();

    builder
      .callback('s1', callbackFunction)
      .pause('s2')
      .callback('s3', callbackFunction);

    runner.onComplete('s2', hookFunction);

    const runnerState = await runner.process({} as never, {
      publisher,
    });

    await runner.resume(runnerState, {
      publisher,
    });

    expect(hookFunction).toHaveBeenCalledTimes(1);

    expect(callbackFunction.mock.invocationCallOrder[0]).toBeLessThan(
      hookFunction.mock.invocationCallOrder[0],
    );

    expect(hookFunction.mock.invocationCallOrder[0]).toBeLessThan(
      callbackFunction.mock.invocationCallOrder[1],
    );
  });
});
