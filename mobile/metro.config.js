const path = require('path');
const { getDefaultConfig, mergeConfig } = require('@react-native/metro-config');
const { withNativeWind } = require('nativewind/metro');

/**
 * Metro configuration
 * https://reactnative.dev/docs/metro
 *
 * @type {import('@react-native/metro-config').MetroConfig}
 */
const config = {
  resolver: {
    resolveRequest: (context, moduleName, platform) => {
      if (moduleName.startsWith('@/')) {
        const absoluteModulePath = path.resolve(
          __dirname,
          'src',
          moduleName.slice(2)
        );

        return context.resolveRequest(context, absoluteModulePath, platform);
      }

      return context.resolveRequest(context, moduleName, platform);
    },
  },
};

module.exports = withNativeWind(
  mergeConfig(getDefaultConfig(__dirname), config),
  { input: './global.css' }
);
