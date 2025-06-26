const { getDefaultConfig } = require('expo/metro-config');
const path = require('path');

const config = getDefaultConfig(__dirname);

// Enable path mapping for ~ alias
config.resolver.alias = {
  '~': path.resolve(__dirname, '~'),
};

module.exports = config; 