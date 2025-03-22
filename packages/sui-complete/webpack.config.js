const path = require('path');
const webpack = require('webpack');

// Get the absolute path to the package directory
const packageDir = __dirname;
const buildDir = path.join(packageDir, 'build');

// Helper to handle workspace dependencies
const resolveWorkspaceDep = (name) => {
  return path.resolve(packageDir, '..', name.replace('@stoked-ui/', 'sui-'));
};

module.exports = {
  mode: 'production',
  entry: {
    index: './src/index.ts',
  },
  target: 'web',
  output: {
    path: path.resolve(__dirname, 'build'),
    filename: '[name].js',
    globalObject: 'typeof self !== "undefined" ? self : this',
    library: {
      name: 'StyledEditor',
      type: 'umd',
      export: 'default',
    },
    umdNamedDefine: true,
  },
  externalsType: 'umd',
  externals: {
    react: {
      commonjs: 'react',
      commonjs2: 'react',
      amd: 'react',
      root: 'React',
    },
    'react-dom': {
      commonjs: 'react-dom',
      commonjs2: 'react-dom',
      amd: 'react-dom',
      root: 'ReactDOM',
    },
    'prop-types': {
      commonjs: 'prop-types',
      commonjs2: 'prop-types',
      amd: 'prop-types',
      root: 'PropTypes',
    },
  },
  resolve: {
    extensions: ['.ts', '.tsx', '.js', '.jsx'],
    modules: ['node_modules', path.resolve(__dirname, 'src')],
  },
  module: {
    rules: [
      {
        test: /\.tsx?$/,
        use: [
          {
            loader: 'ts-loader',
            options: {
              transpileOnly: true,
            },
          },
        ],
        exclude: /node_modules/,
      },
      {
        test: /\.jsx?$/,
        use: {
          loader: 'babel-loader',
          options: {
            presets: [
              '@babel/preset-env',
              '@babel/preset-react',
            ],
            plugins: [
              '@babel/plugin-proposal-class-properties',
            ],
          },
        },
        exclude: /node_modules/,
      },
      {
        test: /\.css$/,
        use: ['style-loader', 'css-loader'],
      },
      {
        test: /\.(png|svg|jpg|jpeg|gif)$/i,
        type: 'asset/resource',
      },
    ],
  },
  plugins: [
    // Define process.env.NODE_ENV for any modules using it
    new webpack.DefinePlugin({
      'process.env.NODE_ENV': JSON.stringify('production'),
    }),
    // Provide React and ReactDOM from window for modules that expect them globally
    new webpack.ProvidePlugin({
      React: 'react',
      ReactDOM: 'react-dom',
    }),
    // Add banner to instruct users about React
    new webpack.BannerPlugin({
      banner: `
        StyledEditor v1.0.0
        This package requires React and ReactDOM to be loaded before it.
        If you see an error about 'React', make sure React is available in the global scope.
        Example: window.React = require('react');
      `,
      entryOnly: true,
    }),
  ],
  performance: {
    // Ignore warnings about bundle size
    hints: false,
  },
};
