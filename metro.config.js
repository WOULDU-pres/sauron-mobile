const { withNativeWind } = require('nativewind/metro');
const { getDefaultConfig } = require('@expo/metro-config');
const path = require('path');

// Get the default Expo Metro config for SDK 53
const config = getDefaultConfig(__dirname);

// Add custom alias for the tilde (~) path
config.resolver.alias = {
  '~': path.resolve(__dirname, '~'),
};

// Add additional asset extensions if needed
config.resolver.assetExts.push(
  'bin', 'txt', 'pdf', 'zip', 'gz', 'tar', 'lz4', 'apk', 'aab',
  'mp4', 'webm', 'mp3', 'wav', 'flac', 'aac', 'ogg', 'opus',
  'mkv', 'mov', 'avi', 'wmv', 'mpg', 'ogv', 'webv'
);

// Optimize for development
config.maxWorkers = 2;
config.resetCache = true;

module.exports = withNativeWind(config, { input: './global.css' }); 