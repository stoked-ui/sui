const path = require('path');

module.exports = {
  context: path.resolve(__dirname),
  resolve: {
    modules: [__dirname, 'node_modules'],
    alias: {
      '@stoked-ui/docs-markdown': path.resolve(__dirname, './packages-internal/markdown'),
      '@stoked-ui/media-selector': path.resolve(__dirname, './packages/sui-media-selector/src'),
      '@stoked-ui/docs': path.resolve(__dirname, './packages/sui-docs/src'),
      '@stoked-ui/common': path.resolve(__dirname, './packages/sui-common/src'),
      '@stoked-ui/timeline': path.resolve(__dirname, './packages/sui-timeline/src'),
      '@stoked-ui/file-explorer': path.resolve(__dirname, './packages/sui-file-explorer/src'),
      '@stoked-ui/editor': path.resolve(__dirname, './packages/sui-editor/src'),
      '@stoked-ui/docs-utils': path.resolve(__dirname, './packages-internal/docs-utils/src'),
      '@stoked-ui/proptypes/typescript-to-proptypes': path.resolve(
        __dirname,
        './packages-internal/scripts/typescript-to-proptypes/src'
      ),
      docs: path.resolve(__dirname, './docs'),
      // Alias `cheerio` to use compatible browser-friendly version
      cheerio: 'cheerio/lib/cheerio',
    },
    extensions: ['.js', '.ts', '.tsx', '.d.ts'],
  },
  module: {
    rules: [
      // Transpile all JS/TS files with Babel or ts-loader for compatibility
      {
        test: /\.(js|jsx|ts|tsx)$/,
        exclude: /node_modules/,
        use: {
          loader: 'babel-loader',
          options: {
            presets: [
              '@babel/preset-env', // Transpile modern JS to ES5
              '@babel/preset-react', // Support JSX
              '@babel/preset-typescript', // Support TypeScript
            ],
          },
        },
      },
      // Resolve fully-specified ES modules
      {
        test: /\.js$/,
        resolve: {
          fullySpecified: false,
        },
      },
    ],
  },
  resolve: {
    fallback: {
      fs: false, // Prevent node-only modules like `fs` from breaking the build
      path: false,
    },
  },
};

