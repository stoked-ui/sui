/**
 * Next.js configuration helper for @stoked-ui/media-selector
 *
 * Usage:
 *
 * // next.config.js
 * const withStokedUI = require('@stoked-ui/media-selector/next.config.js');
 *
 * module.exports = withStokedUI({
 *   // your Next.js config here
 * });
 */

module.exports = function withStokedUI(nextConfig = {}) {
  return {
    ...nextConfig,
    transpilePackages: [
      '@stoked-ui/media-selector',
      ...(nextConfig.transpilePackages || []),
    ],
    experimental: {
      ...nextConfig.experimental,
      esmExternals: false,
    },
    webpack: (config, options) => {
      // Handle webpack configuration to avoid SSR issues

      // Use Next.js's webpack function if it exists
      if (typeof nextConfig.webpack === 'function') {
        config = nextConfig.webpack(config, options);
      }

      return config;
    },
  };
};
