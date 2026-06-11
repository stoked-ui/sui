const forbidCreateStylesMessage =
  'Use `MuiStyles<ClassKey, Props>` instead if the styles are exported. Otherwise, use `as const` assertions. ' +
  '`createStyles` will lead to inlined, at-compile-time-resolved type-imports. ' +
  'See https://github.com/microsoft/TypeScript/issues/36097#issuecomment-578324386 for more information';

module.exports = {
  root: true, // So parent files don't get applied
  env: {
    es6: true,
    browser: true,
    node: true,
  },
  extends: [
    'plugin:eslint-plugin-import/recommended',
    'plugin:eslint-plugin-import/typescript',
    'eslint-config-airbnb',
    'eslint-config-airbnb-typescript',
    'eslint-config-prettier',
  ],
  parser: '@typescript-eslint/parser',
  parserOptions: {
    ecmaVersion: 7,
  },
  plugins: [
    'eslint-plugin-stoked-ui',
    'eslint-plugin-react-hooks',
    '@typescript-eslint/eslint-plugin',
    'eslint-plugin-filenames',
  ],
  settings: {
    'import/resolver': {
      node: {
        extensions: ['.js', '.ts', '.tsx', '.d.ts'],
        moduleDirectory: ['node_modules', '.'],
      },
    },
  },
  rules: {
    // Rules turned off — never enforced / stylistic / false positives
    'no-void': 'off',
    'vars-on-top': 'off',
    'no-nested-ternary': 'off',
    'no-plusplus': 'off',
    'no-bitwise': 'off',
    'spaced-comment': 'off',
    'no-multi-assign': 'off',
    strict: 'off',
    'class-methods-use-this': 'off',
    'no-await-in-loop': 'off',
    'no-sequences': 'off',
    'no-return-assign': 'off',
    'block-scoped-var': 'off',
    'no-cond-assign': 'off',
    'one-var': 'off',
    eqeqeq: 'off',
    'no-var': 'off',
    'consistent-return': 'off',
    'no-promise-executor-return': 'off',
    'global-require': 'off',
    'prefer-rest-params': 'off',
    'grouped-accessor-pairs': 'off',
    'no-return-await': 'off',
    'import/prefer-default-export': 'off',
    'import/export': 'off',
    'no-undef': 'off',
    'no-restricted-globals': 'off',
    radix: 'off',
    'react/prop-types': 'off',
    'react/no-unused-prop-types': 'off',
    'react/no-unescaped-entities': 'off',
    'react/button-has-type': 'off',
    'react/function-component-definition': 'off',
    'react-hooks/rules-of-hooks': 'off',
    'no-shadow': 'off',
    '@typescript-eslint/no-shadow': 'off',
    'filenames/match-exported': 'off',
    'no-useless-escape': 'off',
    'no-constant-condition': 'off',
    'no-empty-pattern': 'off',
    'no-dupe-else-if': 'off',
    'no-template-curly-in-string': 'off',
    'no-inner-declarations': 'off',
    'no-extend-native': 'off',
    'default-case': 'off',
    'prefer-const': 'off',
    'import/no-self-import': 'off',
    'import/no-mutable-exports': 'off',
    'import/no-named-as-default': 'off',
    'import/no-named-default': 'off',
    'import/no-import-module-exports': 'off',
    'react/no-unstable-nested-components': 'off',
    'react/jsx-pascal-case': 'off',
    'react/jsx-no-duplicate-props': 'off',
    'react/jsx-no-undef': 'off',
    '@typescript-eslint/no-useless-constructor': 'off',
    '@typescript-eslint/no-empty-function': 'off',
    '@typescript-eslint/no-unused-expressions': 'off',
    '@typescript-eslint/no-loop-func': 'off',
    '@typescript-eslint/default-param-last': 'off',
    '@typescript-eslint/no-redeclare': 'off',
    'jsx-a11y/label-has-associated-control': 'off',
    'jsx-a11y/click-events-have-key-events': 'off',
    'jsx-a11y/no-static-element-interactions': 'off',
    'jsx-a11y/no-noninteractive-element-to-interactive-role': 'off',
    'jsx-a11y/media-has-caption': 'off',
    'jsx-a11y/control-has-associated-label': 'off',

    'consistent-this': ['error', 'self'],
    curly: ['error', 'all'],
    // Just as bad as "max components per file"
    'max-classes-per-file': 'off',
    'no-alert': 'off',
    // Stylistic opinion
    'arrow-body-style': 'off',
    // Scripts, demos, and benchmarks use console.log; was never enforced
    'no-console': 'off',
    'no-param-reassign': 'off', // It's fine.
    'func-names': 'off',
    'no-restricted-imports': 'off',
    'no-continue': 'off',
    // Use the proptype inheritance chain
    'no-prototype-builtins': 'off',
    'no-underscore-dangle': 'off',
    'nonblock-statement-body-position': 'off',
    'prefer-arrow-callback': 'off',
    // Destructuring harm grep potential.
    'prefer-destructuring': 'off',

    'no-constructor-return': 'off',
    '@typescript-eslint/no-use-before-define': 'off',
    '@typescript-eslint/naming-convention': 'off',
    '@typescript-eslint/lines-between-class-members': 'off',
    '@typescript-eslint/no-unused-vars': 'off',
    'no-use-before-define': 'off',

    // disabled type-aware linting due to performance considerations
    '@typescript-eslint/dot-notation': 'off',
    'dot-notation': 'error',
    // disabled type-aware linting due to performance considerations
    '@typescript-eslint/no-implied-eval': 'off',
    'no-implied-eval': 'error',
    // disabled type-aware linting due to performance considerations
    '@typescript-eslint/no-throw-literal': 'off',
    'no-throw-literal': 'error',
    // disabled type-aware linting due to performance considerations
    '@typescript-eslint/return-await': 'off',

    // Not sure why it doesn't work
    'import/named': 'off',
    'import/no-cycle': 'off',
    'import/order': 'error',
    // Missing yarn workspace support
    'import/no-extraneous-dependencies': 'off',
    // The code is already coupled to webpack. Prefer explicit coupling.
    'import/no-webpack-loader-syntax': 'off',
    // Resolver doesn't support webpack aliases; was already broken with the webpack resolver
    'import/no-unresolved': 'off',
    // Webpack handles extension resolution; was already broken with the webpack resolver
    'import/extensions': 'off',

    // We are a library, we need to support it too
    'jsx-a11y/no-autofocus': 'off',

    'stoked-ui/docgen-ignore-before-comment': 'off',
    'stoked-ui/rules-of-use-theme-variants': 'off',
    'stoked-ui/no-empty-box': 'off',
    'stoked-ui/no-styled-box': 'off',
    'stoked-ui/straight-quotes': 'off',
    'stoked-ui/sui-name-matches-component-name': 'off',
    'stoked-ui/no-hardcoded-labels': 'off',
    'stoked-ui/disallow-active-element-as-key-event-target': 'off',

    'react-hooks/exhaustive-deps': 'off',

    'react/default-props-match-prop-types': 'off',
    // Can add verbosity to small functions making them harder to grok.
    'react/destructuring-assignment': 'off',
    'react/forbid-prop-types': 'off', // Too strict, no time for that
    'react/jsx-curly-brace-presence': 'off', // broken
    // airbnb is using .jsx
    'react/jsx-filename-extension': ['error', { extensions: ['.js', '.tsx'] }],
    // Prefer <React.Fragment> over <>.
    'react/jsx-fragments': 'off',
    // Enforces premature optimization
    'react/jsx-no-bind': 'off',
    // We are a UI library.
    'react/jsx-props-no-spreading': 'off',
    // This rule is great for raising people awareness of what a key is and how it works.
    'react/no-array-index-key': 'off',
    'react/no-danger': 'error',
    'react/no-direct-mutation-state': 'error',
    // Not always relevant
    'react/require-default-props': 'off',
    'react/sort-prop-types': 'off',
    // This depends entirely on what you're doing. There's no universal pattern
    'react/state-in-constructor': 'off',
    // stylistic opinion. For conditional assignment we want it outside, otherwise as static
    'react/static-property-placement': 'off',
    'react/jsx-no-target-blank': 'off',

    'no-restricted-syntax': 'off',

    // We re-export default in many places, remove when https://github.com/airbnb/javascript/issues/2500 gets resolved
    'no-restricted-exports': 'off',
    // Some of these occurences are deliberate and fixing them will break things in repos that use @monorepo dependency
    'import/no-relative-packages': 'off',
    // Avoid accidental auto-"fixes" https://github.com/jsx-eslint/eslint-plugin-react/issues/3458
    'react/no-invalid-html-attribute': 'off',

    'react/jsx-no-useless-fragment': 'off',
    // React 17+ JSX transform; no longer need React in scope
    'react/react-in-jsx-scope': 'off',
    'lines-around-directive': 'off',
  },
  overrides: [
    {
      files: [
        // matching the pattern of the test runner
        '*.test.mjs',
        '*.test.js',
        '*.test.ts',
        '*.test.tsx',
      ],
      extends: ['plugin:mocha/recommended'],
      rules: {
        // does not work with wildcard imports. Mistakes will throw at runtime anyway
        'import/named': 'off',
        'stoked-ui/disallow-active-element-as-key-event-target': 'error',

        // upgraded level from recommended
        'mocha/no-exclusive-tests': 'error',
        'mocha/no-skipped-tests': 'off',
        'mocha/max-top-level-suites': 'off',

        // no rationale provided in /recommended
        'mocha/no-mocha-arrows': 'off',
        'mocha/no-top-level-hooks': 'off',
        // definitely a useful rule but too many false positives
        // due to `describeConformance`
        // "If you're using dynamically generated tests, you should disable this rule.""
        'mocha/no-setup-in-describe': 'off',
        // `beforeEach` for a single case is optimized for change
        // when we add a test we don't have to refactor the existing
        // test to `beforeEach`.
        // `beforeEach`+`afterEach` also means that the `beforeEach`
        // is cleaned up in `afterEach` if the test causes a crash
        'mocha/no-hooks-for-single-case': 'off',

        // disable eslint-plugin-jsx-a11y
        // tests are not driven by assistive technology
        // add `jsx-a11y` rules once you encounter them in tests
        'jsx-a11y/click-events-have-key-events': 'off',
        'jsx-a11y/control-has-associated-label': 'off',
        'jsx-a11y/iframe-has-title': 'off',
        'jsx-a11y/label-has-associated-control': 'off',
        'jsx-a11y/mouse-events-have-key-events': 'off',
        'jsx-a11y/no-noninteractive-tabindex': 'off',
        'jsx-a11y/no-static-element-interactions': 'off',
        'jsx-a11y/tabindex-no-positive': 'off',

        // In tests this is generally intended.
        'react/button-has-type': 'off',
        // They are accessed to test custom validator implementation with PropTypes.checkPropTypes
        'react/forbid-foreign-prop-types': 'off',
        // components that are defined in test are isolated enough
        // that they don't need type-checking
        'react/prop-types': 'off',
        'react/no-unused-prop-types': 'off',
      },
    },
    {
      files: ['docs/src/modules/components/**/*.js'],
      rules: {
        'stoked-ui/no-hardcoded-labels': 'off',
      },
    },
    // Next.js plugin
    {
      files: ['docs/**/*'],
      extends: ['plugin:@next/next/recommended'],
      settings: {
        next: {
          rootDir: 'docs',
        },
      },
      rules: {
        // We're not using the Image component at the moment
        '@next/next/no-img-element': 'off',
      },
    },
    // Next.js entry points pages
    {
      files: ['docs/pages/**/*.js'],
      rules: {
        'react/prop-types': 'off',
      },
    },
    // demos
    {
      files: ['docs/src/pages/**/*{.tsx,.js}', 'docs/data/**/*{.tsx,.js}'],
      rules: {
        // This most often reports data that is defined after the component definition.
        // This is safe to do and helps readability of the demo code since the data is mostly irrelevant.
        '@typescript-eslint/no-use-before-define': 'off',
        'react/prop-types': 'off',
        'no-alert': 'off',
        'no-console': 'off',
      },
    },
    // demos - proptype generation
    {
      files: ['docs/data/base/components/modal/UseModal.js'],
      rules: {
        'consistent-return': 'off',
        'func-names': 'off',
        'no-else-return': 'off',
        'prefer-template': 'off',
      },
    },
    {
      files: ['docs/data/**/*{.tsx,.js}'],
      rules: {
        'filenames/match-exported': 'off',
      },
    },
    {
      files: ['*.d.ts'],
      rules: {
        'import/export': 'off', // Not sure why it doesn't work
      },
    },
    {
      files: ['*.tsx'],
      excludedFiles: '*.spec.tsx',
      rules: {
        'no-restricted-imports': 'off',
      },
    },
    // Files used for generating TypeScript declaration files (#ts-source-files)
    {
      files: ['packages/*/src/**/*.tsx'],
      excludedFiles: '*.spec.tsx',
      rules: {
        'no-restricted-imports': 'off',
        'react/prop-types': 'off',
      },
    },
    {
      files: ['*.spec.tsx', '*.spec.ts'],
      rules: {
        'no-alert': 'off',
        'no-console': 'off',
        'no-empty-pattern': 'off',
        'no-lone-blocks': 'off',
        'no-shadow': 'off',

        '@typescript-eslint/no-unused-expressions': 'off',
        '@typescript-eslint/no-unused-vars': 'off',
        '@typescript-eslint/no-use-before-define': 'off',

        // Not sure why it doesn't work
        'import/export': 'off',
        'import/prefer-default-export': 'off',

        'jsx-a11y/anchor-has-content': 'off',
        'jsx-a11y/anchor-is-valid': 'off',
        'jsx-a11y/tabindex-no-positive': 'off',

        'react/default-props-match-prop-types': 'off',
        'react/no-access-state-in-setstate': 'off',
        'react/no-unused-prop-types': 'off',
        'react/prefer-stateless-function': 'off',
        'react/prop-types': 'off',
        'react/require-default-props': 'off',
        'react/state-in-constructor': 'off',
        'react/static-property-placement': 'off',
        'react/function-component-definition': 'off',
      },
    },
    {
      files: ['packages-internal/scripts/typescript-to-proptypes/src/**/*.ts'],
      rules: {
        // Working with flags is common in TypeScript compiler
        'no-bitwise': 'off',
      },
    },
    {
      files: ['packages/*/src/**/*{.ts,.tsx,.js}'],
      excludedFiles: ['*.d.ts', '*.spec.ts', '*.spec.tsx'],
      rules: {
        'import/no-cycle': 'off',
        'stoked-ui/sui-name-matches-component-name': 'off',
      },
    },
    {
      files: ['test/bundling/scripts/**/*.js'],
      rules: {
        // ES modules need extensions
        'import/extensions': ['error', 'ignorePackages'],
      },
    },
    {
      files: ['**/*.mjs'],
      rules: {
        'import/extensions': ['error', 'ignorePackages'],
      },
    },
  ],
};
