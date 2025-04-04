/**
 * ESLint configuration rules for a project.
 * 
 * @typedef {Object} ESLintRules
 * @property {string} import/prefer-default-export - Disables the rule enforcing default export preference.
 * @property {string} react-hooks/exhaustive-deps - Warns when dependencies are not provided for React hooks.
 * @property {string} import/no-cycle - Throws an error for import cycles.
 * @property {string} import/order - Throws an error when import statements are not ordered correctly.
 * @property {string} jsx-a11y/aria-role - Disables the rule enforcing ARIA role checks in JSX.
 * 
 * @type {ESLintRules}
 */
module.exports = {
  rules: {
    'import/prefer-default-export': 'off',
    'react-hooks/exhaustive-deps': 'warn',
    'import/no-cycle': 'error',
    'import/order': 'error',
    'jsx-a11y/aria-role': 'off',
  },
};