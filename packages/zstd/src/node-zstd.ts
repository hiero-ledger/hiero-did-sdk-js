// Please note that splitting optional dependencies loading to a separate files is done to avoid significant issues with React Native Metro bundler
// See https://github.com/facebook/metro/issues/836

export let nodeZstd;

// Try to load Node.js 'zstd-napi' package
try {
  const nodeZstdModule = require('zstd-napi');
  if (nodeZstdModule.compress) nodeZstd = nodeZstdModule;
} catch {
  // Ignore
}
