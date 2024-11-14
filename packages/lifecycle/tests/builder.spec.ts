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

      builder.callback(callbackFunction);

      expect(builder.length).toBe(1);
      expect(builder.get(0)).toEqual({
        type: 'callback',
        callback: callbackFunction,
      });
    });

    it('should be able to add a signature step', () => {
      const builder = new LifecycleBuilder();

      builder.signature();

      expect(builder.length).toBe(1);
      expect(builder.get(0)).toEqual({ type: 'signature' });
    });

    it('should be able to add a sign step', () => {
      const builder = new LifecycleBuilder();

      builder.signWithSigner();

      expect(builder.length).toBe(1);
      expect(builder.get(0)).toEqual({ type: 'sign' });
    });

    it('should be able to add a pause step', () => {
      const builder = new LifecycleBuilder();

      builder.pause();

      expect(builder.length).toBe(1);
      expect(builder.get(0)).toEqual({ type: 'pause' });
    });

    it('should add steps in the order they are added', () => {
      const builder = new LifecycleBuilder();

      const callbackFunction = jest.fn();

      builder.callback(callbackFunction).signature().signWithSigner();

      expect(builder.length).toBe(3);
      expect(builder.get(0)).toEqual({
        type: 'callback',
        callback: callbackFunction,
      });
      expect(builder.get(1)).toEqual({ type: 'signature' });
      expect(builder.get(2)).toEqual({ type: 'sign' });
    });

    it('should add a catch step', () => {
      const builder = new LifecycleBuilder();

      const catchFunction = jest.fn();

      builder.catch(catchFunction);

      expect(builder.catchStep).toEqual({
        type: 'catch',
        callback: catchFunction,
      });
    });

    it('should override the catch step', () => {
      const builder = new LifecycleBuilder();

      const catchFunction1 = jest.fn();
      const catchFunction2 = jest.fn();

      builder.catch(catchFunction1);
      builder.catch(catchFunction2);

      expect(builder.catchStep).toEqual({
        type: 'catch',
        callback: catchFunction2,
      });
    });
  });

  it('should throw an error if the step does not exist', () => {
    const builder = new LifecycleBuilder();

    expect(() => builder.get(0)).toThrow('Step does not exist');
  });
});
