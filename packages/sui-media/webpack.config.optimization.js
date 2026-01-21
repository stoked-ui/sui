/**
 * Bundle Optimization Configuration for sui-media Package
 *
 * This configuration implements code splitting and lazy loading strategies
 * to optimize bundle size and improve initial load times.
 */

const path = require('path');

module.exports = {
  // Tree-shaking configuration
  treeshake: {
    moduleSideEffects: false,
    propertyReadSideEffects: false,
    tryCatchDeoptimization: false,
  },

  // Code splitting strategy
  splitChunks: {
    chunks: 'all',
    cacheGroups: {
      // Heavy components chunk
      mediaComponents: {
        test: /[\\/]src[\\/]components[\\/]/,
        name: 'media-components',
        priority: 20,
        reuseExistingChunk: true,
        enforce: true,
      },

      // MediaCard component - most commonly used
      mediaCard: {
        test: /[\\/]src[\\/]components[\\/]MediaCard[\\/]/,
        name: 'media-card',
        priority: 30,
        reuseExistingChunk: true,
        enforce: true,
      },

      // MediaViewer component - heavy and used separately
      mediaViewer: {
        test: /[\\/]src[\\/]components[\\/]MediaViewer[\\/]/,
        name: 'media-viewer',
        priority: 30,
        reuseExistingChunk: true,
        enforce: true,
      },

      // External dependencies
      vendors: {
        test: /[\\/]node_modules[\\/]/,
        name: 'vendors',
        priority: -10,
        reuseExistingChunk: true,
      },

      // Common modules
      common: {
        minChunks: 2,
        priority: -20,
        reuseExistingChunk: true,
      },
    },
  },

  // Module resolution
  resolve: {
    // Prefer ES modules for tree-shaking
    mainFields: ['module', 'main'],
    extensions: ['.ts', '.tsx', '.js', '.jsx'],
    // Alias heavy components for lazy loading
    alias: {
      '@media-viewer': path.resolve(__dirname, 'src/components/MediaViewer'),
      '@media-card': path.resolve(__dirname, 'src/components/MediaCard'),
      '@media-abstractions': path.resolve(__dirname, 'src/abstractions'),
    },
  },

  // Optimization settings
  optimization: {
    // Minimize and mangle
    minimize: true,
    usedExports: true,
    sideEffects: false,

    // Module IDs for deterministic builds
    moduleIds: 'deterministic',

    // Runtime chunk for webpack runtime
    runtimeChunk: {
      name: 'runtime',
    },

    // Concatenate modules where possible
    concatenateModules: true,
  },

  // Performance budget
  performance: {
    // 150KB soft limit for main bundle
    maxEntrypointSize: 150000,
    // 50KB per chunk limit
    maxAssetSize: 50000,
    // Warn but don't fail on budget violations
    hints: 'warning',
  },
};
