/**
 * Check if the given string is a valid URI.
 * @param uri The URI to check.
 * @returns boolean indicating if the URI is valid.
 */
export function isURI(uri: string): boolean {
  try {
    new URL(uri);
    return true;
  } catch {
    return false;
  }
}
