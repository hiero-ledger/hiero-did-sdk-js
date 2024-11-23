/**
 * Check if a value is a valid JSON string
 * @param value The value to check
 * @returns True if the value is a valid JSON string, false otherwise
 */
export function isJsonString(value: unknown): boolean {
  if (typeof value !== 'string') {
    return false;
  }

  try {
    JSON.parse(value);
    return true;
  } catch {
    return false;
  }
}
