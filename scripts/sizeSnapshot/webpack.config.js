const path = require('path');
const CompressionPlugin = require('compression-webpack-plugin');
const glob = require('fast-glob');
const TerserPlugin = require('terser-webpack-plugin');
const { BundleAnalyzerPlugin } = require('webpack-bundle-analyzer');

const workspaceRoot = path.join(__dirname, '..', '..');

async function getWebpackEntries() {
  const materialPackagePath = path.join(workspaceRoot, 'packages/sui-file-explorer/build');
  const materialComponents = (await glob(path.join(materialPackagePath, '([A-Z])*/index.js'))).map(
    (componentPath) => {
      const componentName = path.basename(path.dirname(componentPath));
      let entryName = componentName;
      // adjust for legacy names
      if (componentName === 'Paper') {
        entryName = '@stoked-ui/core/Paper.esm';
      } else if (componentName === 'TextareaAutosize') {
        entryName = '@stoked-ui-ui/core/Textarea';
      }

      return {
        id: entryName,
        path: path.relative(workspaceRoot, path.dirname(componentPath)),
      };
    },
  );

  return [
    {
      // WARNING: Changing the name will break tracking of bundle size over time
      // If the name of the package changes, rename its display name in https://github.com/eps1lon/mui-contributor-dashboard/blob/main/src/pages/SizeComparison.tsx
      id: '@stoked-ui/core',
      path: path.join(path.relative(workspaceRoot, materialPackagePath), 'index.js'),
    },
    ...materialComponents,
    // TODO: Requires webpack v5
    // Resolution of webpack/acorn to 7.x is blocked by nextjs (https://github.com/vercel/next.js/issues/11947)
    // {
    //   id: '@stoked-ui/core.modern',
    //   webpack: true,
    //   path: path.join(path.relative(workspaceRoot, materialPackagePath), 'modern/index.js'),
    // },

  ];
}

function createWebpackConfig(entry, environment) {
  const analyzerMode = environment.analyze ? 'static' : 'disabled';
  const concatenateModules = !environment.accurateBundles;

  /**
   * @type {import('webpack').Configuration}
   */
  const configuration = {
    // ideally this would be computed from the bundles peer dependencies
    // Ensure that `react` as well as `react/*` are considered externals but not `react*`
    externals: /^(date-fns|dayjs|luxon|moment|react|react-dom)(\/.*)?$/,
    mode: 'production',
    optimization: {
      concatenateModules,
      minimizer: [
        new TerserPlugin({
          test: /\.js(\?.*)?$/i,
        }),
      ],
    },
    output: {
      filename: '[name].js',
      library: {
        // TODO: Use `type: 'module'` once it is supported (currently incompatible with `externals`)
        name: 'M',
        type: 'var',
        // type: 'module',
      },
      path: path.join(__dirname, 'build'),
    },
    plugins: [
      new CompressionPlugin(),
      new BundleAnalyzerPlugin({
        analyzerMode,
        // We create a report for each bundle so around 120 reports.
        // Opening them all is spam.
        // If opened with `webpack --config . --analyze` it'll still open one new tab though.
        openAnalyzer: false,
        // '[name].html' not supported: https://github.com/webpack-contrib/webpack-bundle-analyzer/issues/12
        reportFilename: `${entry.id}.html`,
      }),
    ],
    resolve: {
      alias: {
        '@stoked-ui/file-explorer': path.join(workspaceRoot, 'packages/sui-file-explorer/build'),
      },
    },
    entry: { [entry.id]: path.join(workspaceRoot, entry.path) },
    // TODO: 'browserslist:modern'
    // See https://github.com/webpack/webpack/issues/14203
    target: 'web',
  };

  return configuration;
}

exports.getWebpackEntries = getWebpackEntries;
exports.createWebpackConfig = createWebpackConfig;
