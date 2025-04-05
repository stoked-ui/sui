/**
 * Module exports rules for linting configuration.
 */
module.exports = {
  rules: {
    /**
     * Disable preference for default exports.
     */
    'import/prefer-default-export': 'off',

    /**
     * Warn about exhaustive-deps in React hooks.
     */
    'react-hooks/exhaustive-deps': 'warn',

    /**
     * Error for cyclic imports.
     */
    'import/no-cycle': 'error',

    /**
     * Error for import order.
     */
    'import/order': 'error',

    /**
     * Disable aria-role rule for accessibility.
     */
    'jsx-a11y/aria-role': 'off',
  },
};