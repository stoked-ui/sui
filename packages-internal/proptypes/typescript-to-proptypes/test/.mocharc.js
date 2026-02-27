module.exports = {
  extension: ['js', 'ts', 'tsx'],
  ignore: ['**/node_modules/**'],
  require: [require.resolve('./testSetup')],
  timeout: 10000,
};
