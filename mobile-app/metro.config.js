const path = require('path');
const { getDefaultConfig } = require('expo/metro-config');

const config = getDefaultConfig(__dirname);

// Configuration pour résoudre les problèmes TurboModules/Bridgeless
config.resolver.platforms = ['ios', 'android', 'native', 'web'];

// RN 0.81: Completely disable DevTools to avoid React 19 compatibility issues
config.resolver.alias = Object.assign(
  {},
  config.resolver.alias || {},
  {
    // Map all DevTools setup files to a no-op stub
    'react-native/Libraries/Core/setUpReactDevTools': path.resolve(
      __dirname,
      'metro-stubs/react-native-devtools-stub.js'
    ),
    'react-native/Libraries/Core/setUpReactDevTools.js': path.resolve(
      __dirname,
      'metro-stubs/react-native-devtools-stub.js'
    ),
    'react-native/src/private/devsupport/rndevtools/setUpFuseboxReactDevToolsDispatcher': path.resolve(
      __dirname,
      'metro-stubs/react-native-devtools-stub.js'
    ),
    'react-native/src/private/devsupport/rndevtools/setUpFuseboxReactDevToolsDispatcher.js': path.resolve(
      __dirname,
      'metro-stubs/react-native-devtools-stub.js'
    ),
    // Block DevTools setup at developer tools level
    'react-native/Libraries/Core/setUpDeveloperTools': path.resolve(
      __dirname,
      'metro-stubs/react-native-devtools-stub.js'
    ),
    'react-native/Libraries/Core/setUpDeveloperTools.js': path.resolve(
      __dirname,
      'metro-stubs/react-native-devtools-stub.js'
    ),
  }
);module.exports = config;