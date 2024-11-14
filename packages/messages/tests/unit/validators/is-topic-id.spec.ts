import { isTopicId } from '../../../src/validators/is-topic-id';

describe('Is topic ID validator', () => {
  it.each([
    '0.0.123',
    '0.0.123456',
    '0.0.123456789',
    '0.0.1234567890123456789012345678901234567890123456789012345678901234',
    '10.100.123',
    '0.0.0',
  ])('should return true for valid topic ID [%s]', (topicId) => {
    expect(isTopicId(topicId)).toBeTruthy();
  });

  it.each([
    '',
    '...',
    '0.0',
    '0.0.',
    '0.0.0.',
    '0',
    '0.',
    'string',
    '0.0.string',
  ])('should return false for invalid topic ID [%s]', (topicId) => {
    expect(isTopicId(topicId)).toBeFalsy();
  });
});
