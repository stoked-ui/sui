/**
 * Module exporting ESLint rules configuration.
 */
module.exports = {
  /**
   * ESLint rules configuration.
   * @property {string} 'import/prefer-default-export' - Disable prefer default export rule.
   * @property {string} 'react-hooks/exhaustive-deps' - Set exhaustive-deps rule to warning.
   * @property {string} 'no-underscore-dangle' - Disable no-underscore-dangle rule.
   * @property {string} 'import/no-cycle' - Disable no-cycle rule.
   * @property {string} 'import/order' - Set import order rule to error.
   */
  rules: {
    'import/prefer-default-export': 'off',
    'react-hooks/exhaustive-deps': 'warn',
    'no-underscore-dangle': 'off',
    'import/no-cycle': 'off',
    'import/order': 'error',
  },
};