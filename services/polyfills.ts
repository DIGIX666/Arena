// Polyfill pour React Native
import 'react-native-get-random-values';

// Polyfill pour Buffer si nécessaire
if (typeof global.Buffer === 'undefined') {
  global.Buffer = require('buffer').Buffer;
}

// Polyfill pour process si nécessaire
if (typeof global.process === 'undefined') {
  global.process = require('process');
}

export { };

