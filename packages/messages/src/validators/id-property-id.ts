const ID_PATTERN = /^#[a-zA-Z0-9-_]+$/;

/**
 * Validates if a string is a valid property ID for a DID document properties like verificationMethod or service.
 * @param value The value to validate.
 * @returns boolean indicating if the value is a valid property ID.
 */
export function isPropertyID(value: string): boolean {
  return ID_PATTERN.test(value);
}
