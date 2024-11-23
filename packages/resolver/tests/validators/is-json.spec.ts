import { isJsonString } from '../../src/validators/is-json';

describe('isJsonString validator', () => {
  it.each([
    '{}',
    '{"key": "value"}',
    '{"key": "value", "key2": "value2"}',
    '{"key": "value", "key2": "value2", "key3": "value3"}',
  ])('should return true for valid JSON string', (jsonString) => {
    expect(isJsonString(jsonString)).toBe(true);
  });

  it.each([
    '{key: value}',
    '{"key": value}',
    '"{"key": "value"}"',
    '{key: "value"}',
    123,
    false,
    true,
    [],
    {},
  ])('should return false for invalid JSON string', (jsonString) => {
    expect(isJsonString(jsonString)).toBe(false);
  });
});
