import { waitForChangesVisibility } from '../../src/shared/changes-awaiter';

describe('waitForChangesVisibility', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('resolves when checkFn passes', async () => {
    const fetchFn = vi.fn().mockResolvedValue('ready');
    const checkFn = vi.fn((value: string) => value === 'ready');

    await expect(
      waitForChangesVisibility({
        fetchFn,
        checkFn,
        waitTimeout: 1000,
      })
    ).resolves.toBeUndefined();

    expect(fetchFn).toHaveBeenCalledTimes(1);
    expect(checkFn).toHaveBeenCalledTimes(1);
  });

  it('throws timeout error without cause when polling does not fail', async () => {
    const fetchFn = vi.fn().mockResolvedValue('pending');
    const checkFn = vi.fn(() => false);

    const waitPromise = waitForChangesVisibility({
      fetchFn,
      checkFn,
      waitTimeout: 1000,
    });
    const handledPromise = waitPromise.catch((err) => err as Error & { cause?: unknown });

    await vi.advanceTimersByTimeAsync(1500);

    const error = await handledPromise;

    expect(error).toBeInstanceOf(Error);
    expect(error.message).toBe('Timeout of 1000ms exceeded while waiting for changes visibility');
    expect(error.cause).toBeUndefined();
  });

  it('throws timeout error with the last polling error as cause', async () => {
    const firstError = new Error('503 Service Unavailable');
    const secondError = new Error('429 Too Many Requests');

    const fetchFn = vi
      .fn()
      .mockRejectedValueOnce(firstError)
      .mockRejectedValueOnce(secondError)
      .mockRejectedValue(secondError);

    const waitPromise = waitForChangesVisibility({
      fetchFn,
      checkFn: () => false,
      waitTimeout: 1000,
    });
    const handledPromise = waitPromise.catch((err) => err as Error & { cause?: unknown });

    await vi.advanceTimersByTimeAsync(1500);

    const error = await handledPromise;

    expect(error).toBeInstanceOf(Error);
    expect(error.message).toBe('Timeout of 1000ms exceeded while waiting for changes visibility');
    expect(error.cause).toBe(secondError);
    expect(Object.prototype.propertyIsEnumerable.call(error, 'cause')).toBe(false);
  });
});
