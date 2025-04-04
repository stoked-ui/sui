/**
 * Module exports configuration object.
 *
 * This object defines the rules for the ESLint linter used by React applications.
 */
module.exports = {
  /**
   * Configuration rules object.
   */
  rules: {
    /**
     * Disables the `prefer-default-export` rule, which suggests using default export when possible.
     */
    'import/prefer-default-export': 'off',
    /**
     * Warns about missing exhaustive deps in React hooks.
     */
    'react-hooks/exhaustive-deps': 'warn',
    /**
     * Disables the `no-underscore-dangle` rule, which prevents usage of underscores as property names.
     */
    'no-underscore-dangle': 'off',
    /**
     * Disables the `import/no-cycle` rule, which detects cyclic imports.
     */
    'import/no-cycle': 'off',
    /**
     * Enforces consistent import order using the `import-order` rule.
     */
    'import/order': 'error'
  },
};