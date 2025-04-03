/**
 * Configuration object for ESLint rules.
 */
module.exports = {
  /**
   * Array of rules to apply or disable.
   */
  rules: {
    /**
     * Disables the rule for preferDefaultExport.
     */
    'import/prefer-default-export': 'off',
    
    /**
     * Warns about using excessive dependencies with react-hooks.
     */
    'react-hooks/exhaustive-deps': 'warn',
    
    /**
     * Disables the rule for no-underscore-dangle.
     */
    'no-underscore-dangle': 'off',
    
    /**
     * Disables the rule for import-cycle.
     */
    'import/no-cycle': 'off',
    
    /**
     * Enforces a consistent ordering of imports.
     */
    'import/order': 'error'
  },
};