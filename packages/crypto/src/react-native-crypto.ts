// Please note that splitting optional dependencies loading to a separate files is done to avoid significant issues with React Native Metro bundler
// See https://github.com/facebook/metro/issues/836

export let rnCrypto;

// Try to load 'react-native-quick-crypto' package (for React Native environments)
try {
  const rnCryptoModule = require('react-native-quick-crypto');
  if (rnCryptoModule.createHash) rnCrypto = rnCryptoModule;
} catch {
  // Ignore
}
