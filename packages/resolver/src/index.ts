export function getResolver() {
  function resolve() {
    throw new Error('Not implemented');
  }

  return { hedera: resolve };
}
