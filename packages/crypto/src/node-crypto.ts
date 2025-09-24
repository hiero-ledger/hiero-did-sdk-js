// Please note that splitting optional dependencies loading to a separate files is done to avoid significant issues with React Native Metro bundler
// See https://github.com/facebook/metro/issues/836

export let nodeCrypto;

// Try to load built-in Node.js crypto module
try {
  const nodeCryptoModule = require('crypto');
  if (nodeCryptoModule.createHash) nodeCrypto = nodeCryptoModule;
} catch {
  // Ignore
}
