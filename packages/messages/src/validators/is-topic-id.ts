const TOPIC_ID_PATTERN = /^\d+\.\d+\.\d+$/;

/**
 * Validates if a string is a valid Hedera topic ID.
 * @param value The value to validate.
 * @returns boolean indicating if the value is a valid topic ID.
 */
export function isTopicId(value: string): boolean {
  return TOPIC_ID_PATTERN.test(value);
}
