/**
 * ESLint configuration module for customizing linting rules.
 * 
 * @typedef {Object} ESLintRules
 * @property {Object} rules - A collection of ESLint rules to enforce or disable.
 * 
 * @description
 * This module exports a configuration object for ESLint, specifying rules that
 * the linter should enforce or ignore. Customize these rules to align with
 * your project's coding standards and practices.
 * 
 * @example
 * // Example usage in an ESLint configuration file:
 * const eslintConfig = require('./eslint-config');
 * 
 * // Use the exported rules
 * module.exports = {
 *   ...eslintConfig,
 *   // Additional custom configuration
 * };
 */
module.exports = {
  rules: {
    /** @property {string} 'import/prefer-default-export' - Disables the rule enforcing default exports. */
    'import/prefer-default-export': 'off',
    /** @property {string} 'react-hooks/exhaustive-deps' - Warns when dependencies are missing in React hooks. */
    'react-hooks/exhaustive-deps': 'warn',
    /** @property {string} 'no-underscore-dangle' - Disables the rule preventing identifier names with leading underscores. */
    'no-underscore-dangle': 'off',
    /** @property {string} 'import/no-cycle' - Disables the rule preventing cyclic dependencies in imports. */
    'import/no-cycle': 'off',
    /** @property {string} 'import/order' - Enforces a specific import order. Throws an error if not followed. */
    'import/order': 'error'
  },
};