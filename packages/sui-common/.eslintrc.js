/**
 * Module exports configuration object.
 *
 * @interface RulesConfig
 * 
 * @description This object contains rule configurations for the linter.
 * 
 * @property {Object} rules - Rule configurations for the linter.
 *   @see https://eslint.org/docs/user-guide/configuring/advanced-options.html
 */
module.exports = {
  /**
   * Rule configurations for the linter.
   *
   * @typedef {Object} RulesConfig
   * 
   * @property {string[]} rules - Array of rule names to enable or disable.
   *   Enables or disables specific ESLint rules.
   *   For example: 'import/prefer-default-export' enables the default export rule.
   */
  rules: {
    /**
     * Disables the import/prefer-default-export rule.
     *
     * This rule recommends using a default export in JSX files, but it can cause issues with some libraries.
     * Disabling this rule allows for more flexibility when working with specific libraries or projects.
     */
    'import/prefer-default-export': 'off',
    /**
     * Warns about missing exhaustive deps in React Hooks.
     *
     * This rule checks if all dependencies in a React Hook are explicitly listed in the dependency array.
     * If not, it will display a warning message to prompt the developer to add them.
     */
    'react-hooks/exhaustive-deps': 'warn',
    /**
     * Disables the no-underscore-dangle rule.
     *
     * This rule recommends using camelCase or PascalCase for property names that start with an underscore.
     * Disabling this rule allows for more flexibility when working with specific libraries or projects.
     */
    'no-underscore-dangle': 'off',
    /**
     * Disables the import/no-cycle rule.
     *
     * This rule checks if a module is imported by another module, but it does not check if the imported module
     * has any cycles in its own imports. Disabling this rule allows for more flexibility when working with complex
     * project structures.
     */
    'import/no-cycle': 'off',
    /**
     * Enables the import/order rule with an error severity.
     *
     * This rule determines the import order in the project using eslint-plugin-import and enforces it.
     * If the import order is not followed, ESLint will display an error message.
     */
    'import/order': 'error'
  },
};