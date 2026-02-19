const DEFAULT_TIMEOUT = 2 * 60 * 1000; // 2 minutes

const POLLING_INTERVAL = 500;

/**
 * Wait Hedera consensus changes
 * @param options
 * @private
 */
export async function waitForChangesVisibility<T>(options: {
  fetchFn: () => Promise<T>;
  checkFn: (item: T) => boolean;
  waitTimeout?: number;
}): Promise<void> {
  const { fetchFn, checkFn, waitTimeout } = options;
  const timeout = waitTimeout ?? DEFAULT_TIMEOUT;
  const startTime = Date.now();

  while (Date.now() - startTime < timeout) {
    try {
      const data = await fetchFn();
      if (checkFn(data)) {
        return;
      }
    } catch {
      // Ignore
    }

    await new Promise((resolve) => setTimeout(resolve, POLLING_INTERVAL));
  }

  throw new Error(`Timeout of ${timeout}ms exceeded while waiting for changes visibility`);
}
