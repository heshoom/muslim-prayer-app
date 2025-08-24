const { getDefaultConfig } = require('expo/metro-config');

const config = getDefaultConfig(__dirname);

// Only watch the frontend directory
config.watchFolders = [__dirname];

// Explicitly set the project root to frontend directory
config.projectRoot = __dirname;

module.exports = config;
