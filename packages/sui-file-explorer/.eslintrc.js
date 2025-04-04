/**
 * Module exports configuration for ESLint rules.
 *
 * @module eslintConfig
 */

module.exports = {
  /**
   * Disables the `prefer-default-export` rule, which enforces that functions exported as default
   * should be explicitly marked as such.
   */
  rules: {
    'import/prefer-default-export': 'off',
    /**
     * Warns about using React Hooks with incomplete dependency arrays.
     * This can lead to stale props and unexpected behavior.
     */
    'react-hooks/exhaustive-deps': 'warn',
    /**
     * Enforces that there are no circular imports in the project.
     * This helps prevent infinite loops when importing modules.
     */
    'import/no-cycle': 'error',
    /**
     * Enforces a specific order for import statements.
     * This helps maintain consistency and readability in the codebase.
     */
    'import/order': 'error',
    /**
     * Disables the `jsx-a11y` rule, which enforces ARIA roles for JSX elements.
     * While accessibility is important, this rule can sometimes conflict with other
     * libraries or frameworks that handle accessibility differently.
     */
    'jsx-a11y/aria-role': 'off',
  },
};