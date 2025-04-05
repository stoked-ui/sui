/**
 * Module exports rules for ESLint configuration.
 */
module.exports = {
  rules: {
    /**
     * Disable the preference for default exports.
     */
    'import/prefer-default-export': 'off',
    /**
     * Warn about exhaustive-deps in React hooks.
     */
    'react-hooks/exhaustive-deps': 'warn',
    /**
     * Disable the use of underscores in identifiers.
     */
    'no-underscore-dangle': 'off',
    /**
     * Disable cyclic imports checking.
     */
    'import/no-cycle': 'off',
    /**
     * Enforce order in imports.
     */
    'import/order': 'error'
  },
};