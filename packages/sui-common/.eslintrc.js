/**
 * Module exports configuration object.
 *
 * @interface RulesConfig
 */
module.exports = {
  /**
   * Rule configurations for the linter.
   * 
   * @typedef {Object} RulesConfig
   * 
   * @property {string[]} rules - Array of rule names to enable or disable.
   */
  rules: {
    'import/prefer-default-export': 'off',
    'react-hooks/exhaustive-deps': 'warn',
    'no-underscore-dangle': 'off',
    'import/no-cycle': 'off',
    /**
     * Import order configuration.
     *
     * Determines the import order in the project, using the eslint-plugin-import.
     * 
     * @see https://github.com/benmosher/eslint-plugin-import#order
     */
    'import/order': 'error'
  },
};