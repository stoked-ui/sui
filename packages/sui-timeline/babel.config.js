// This config is used by the build scripts to transpile the package
// It supports different output formats (ESM, CJS) based on the BABEL_ENV
module.exports = function getBabelConfig(api) {
  const useESModules = api.env(['modern', 'stable', 'rollup']);
  api.cache.using(() => process.env.NODE_ENV);

  return {
    presets: [
      ['@babel/preset-env', { loose: true, modules: useESModules ? false : 'commonjs' }],
      ['@babel/preset-react', { runtime: 'automatic' }],
      '@babel/preset-typescript',
    ],
    plugins: [
      [
        '@babel/plugin-transform-runtime',
        {
          useESModules,
          // Any package needs to declare its version of runtime
          version: '^7.21.0',
        },
      ],
    ],
    ignore: [
      '**/*.test.js',
      '**/*.test.ts',
      '**/*.test.tsx',
      '**/*.spec.ts',
      '**/*.spec.tsx',
      '**/*.d.ts',
    ],
  };
};
