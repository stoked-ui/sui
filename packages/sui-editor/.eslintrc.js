/**
 * Configuration rules for ESLint and TypeScript.
 */
module.exports = {
  rules: {
    'import/prefer-default-export': 'off',
    'react-hooks/exhaustive-deps': 'warn',
    'import/no-cycle': 'error',
    'no-underscore-dangle': 'off',
    'jsx-a11y/aria-role': 'off',
    'jsx-a11y/anchor-is-valid': 'off',
    'import/order': 'error',
    '@typescript-eslint/no-unused-vars': 'off',
  },
};