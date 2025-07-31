/**
 * Wait Hedera consensus changes
 * @param options
 * @private
 */
export async function waitForChangesVisibility<T>(options: {
  fetchFn: () => Promise<T>;
  checkFn: (item: T) => boolean;
  waitTimeout?: number;
}): Promise<boolean> {
  const { fetchFn, checkFn, waitTimeout } = options;
  const timeout = waitTimeout ?? 5000;
  const interval = 500;
  const startTime = Date.now();
  let isChangesAvailable = false;

  while (Date.now() - startTime < timeout && !isChangesAvailable) {
    try {
      const data = await fetchFn();
      if (checkFn(data)) {
        isChangesAvailable = true;
        break;
      }
    } catch {
      // Ignore
    }

    await new Promise((resolve) => setTimeout(resolve, interval));
  }

  return isChangesAvailable;
}
