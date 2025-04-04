module.exports = {
  /**
   * Rule configuration for ESLint
   */
  rules: {
    /**
     * Disables the rule to prefer default export in ES modules.
     * This rule is disabled because we don't want to enforce a specific import style.
     */
    'import/prefer-default-export': 'off',

    /**
     * Warns about missing dependencies when using React Hooks.
     * This rule is set to warn because we are aware of the potential issues and choose not to enable it for this project.
     */
    'react-hooks/exhaustive-deps': 'warn',

    /**
     * Enforces that there should be no cyclic imports.
     * This rule is enabled because cyclic imports can cause unexpected behavior in our application.
     */
    'import/no-cycle': 'error',

    /**
     * Disables the rule to prevent underlines from being used as property names.
     * This rule is disabled because we have existing code that uses underscores as property names.
     */
    'no-underscore-dangle': 'off',

    /**
     * Warns about anchor elements that may not be valid for accessibility reasons.
     * This rule is set to off because we don't want to enforce a specific accessibility style.
     */
    'jsx-a11y/aria-role': 'off',

    /**
     * Disables the rule to validate anchors in JSX files.
     * This rule is disabled because we don't want to enforce a specific anchor validation style.
     */
    'jsx-a11y/anchor-is-valid': 'off',

    /**
     * Enforces a consistent ordering of imports based on their location.
     * This rule is enabled because it helps maintain code readability and consistency.
     */
    'import/order': 'error',

    /**
     * Disables the rule to warn about unused variables in TypeScript files.
     * This rule is disabled because we don't want to enforce a specific variable usage style.
     */
    '@typescript-eslint/no-unused-vars': 'off',
  },
};