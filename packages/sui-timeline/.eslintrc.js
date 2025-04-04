/**
 * Module exports an object with configuration rules for a React application.
 *
 * @module Rules
 */

 /**
  * Configuration rules for the React application.
  *
  * This object defines various rules to enforce consistency and best practices in the application's codebase.
  */
module.exports = {
  rules: {
    /**
     * Disables the 'import/prefer-default-export' rule, which suggests default exports for modules.
     */
    'import/prefer-default-export': 'off',
    /**
     * Enables the 'react-hooks/exhaustive-deps' rule, which warns about missing dependencies in React hooks.
     */
    'react-hooks/exhaustive-deps': 'warn',
    /**
     * Disables the 'no-underscore-dangle' rule, which enforces consistent naming conventions for variables and properties.
     */
    'no-underscore-dangle': 'off',
    /**
     * Disables the 'import/no-cycle' rule, which detects circular imports in modules.
     */
    'import/no-cycle': 'off',
    /**
     * Enables the 'import/order' rule, which enforces a specific order for imported modules and their dependencies.
     */
    'import/order': 'error',
  },
};