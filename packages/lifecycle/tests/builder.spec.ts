import { LifecycleBuilder } from '../src';

describe('Lifecycle builder class', () => {
  it('should be able to create a new instance', () => {
    const builder = new LifecycleBuilder();
    expect(builder).toBeInstanceOf(LifecycleBuilder);
  });

  it('should have a length of 0 when no steps are added', () => {
    const builder = new LifecycleBuilder();
    expect(builder.length).toBe(0);
  });

  describe('adding steps to the pipeline', () => {
    it('should be able to add a callback step', () => {
      const builder = new LifecycleBuilder();

      const callbackFunction = jest.fn();

      builder.callback('s1', callbackFunction);

      expect(builder.length).toBe(1);
      expect(builder.getByIndex(0)).toEqual({
        type: 'callback',
        label: 's1',
        callback: callbackFunction,
      });
    });

    it('should be able to add a signature step', () => {
      const builder = new LifecycleBuilder();

      builder.signature('s1');

      expect(builder.length).toBe(1);
      expect(builder.getByIndex(0)).toEqual({ type: 'signature', label: 's1' });
    });

    it('should be able to add a sign step', () => {
      const builder = new LifecycleBuilder();

      builder.signWithSigner('s1');

      expect(builder.length).toBe(1);
      expect(builder.getByLabel('s1')).toEqual({ type: 'sign', label: 's1' });
    });

    it('should be able to add a pause step', () => {
      const builder = new LifecycleBuilder();

      builder.pause('s1');

      expect(builder.length).toBe(1);
      expect(builder.getByLabel('s1')).toEqual({ type: 'pause', label: 's1' });
    });

    it('should add steps in the order they are added', () => {
      const builder = new LifecycleBuilder();

      const callbackFunction = jest.fn();

      builder
        .callback('s1', callbackFunction)
        .signature('s2')
        .signWithSigner('s3');

      expect(builder.length).toBe(3);
      expect(builder.getByIndex(0)).toEqual({
        type: 'callback',
        label: 's1',
        callback: callbackFunction,
      });
      expect(builder.getByLabel('s2')).toEqual({
        type: 'signature',
        label: 's2',
      });
      expect(builder.getByIndex(2)).toEqual({ type: 'sign', label: 's3' });
    });

    it('should add a catch step', () => {
      const builder = new LifecycleBuilder();

      const catchFunction = jest.fn();

      builder.catch('s1', catchFunction);

      expect(builder.catchStep).toEqual({
        type: 'catch',
        label: 's1',
        callback: catchFunction,
      });
    });

    it('should override the catch step', () => {
      const builder = new LifecycleBuilder();

      const catchFunction1 = jest.fn();
      const catchFunction2 = jest.fn();

      builder.catch('s1', catchFunction1);
      builder.catch('s1', catchFunction2);

      expect(builder.catchStep).toEqual({
        type: 'catch',
        label: 's1',
        callback: catchFunction2,
      });
    });
  });

  it('should throw an error if the step does not exist', () => {
    const builder = new LifecycleBuilder();

    expect(() => builder.getByIndex(0)).toThrow('Step index out of bounds');
  });

  it('should throw an error if the step does not exist', () => {
    const builder = new LifecycleBuilder();

    expect(() => builder.getByLabel('s1')).toThrow(
      `Step with label 's1' does not exist`,
    );
  });

  it('should throw an error if the step does not exist', () => {
    const builder = new LifecycleBuilder();

    expect(() => builder.getIndexByLabel('s1')).toThrow(
      `Step with label 's1' does not exist`,
    );
  });

  it('should throw an error when same label is used', () => {
    const builder = new LifecycleBuilder();

    builder.callback('s1', jest.fn());

    expect(() => builder.callback('s1', jest.fn())).toThrow(
      `Step with label 's1' already exists`,
    );
  });

  it('should get an index of step by a label', () => {
    const builder = new LifecycleBuilder();

    builder
      .callback('s1', jest.fn())
      .callback('s2', jest.fn())
      .callback('s3', jest.fn());

    expect(builder.getIndexByLabel('s1')).toBe(0);
    expect(builder.getIndexByLabel('s2')).toBe(1);
    expect(builder.getIndexByLabel('s3')).toBe(2);
  });
});
