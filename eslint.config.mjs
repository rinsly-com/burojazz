import nextCoreWebVitals from 'eslint-config-next/core-web-vitals'
import nextTypescript from 'eslint-config-next/typescript'
import tseslint from 'typescript-eslint'

// eslint-config-next 16 ships native flat configs, so FlatCompat is no longer
// needed (and crashes when validating them).
//
// Type-aware rules apply only to TS that belongs to this project's program.
// strict-type-checked includes no-floating-promises and no-explicit-any as
// errors; both are restated below so a later override cannot silently drop them.
const eslintConfig = tseslint.config(
  ...nextCoreWebVitals,
  ...nextTypescript,
  {
    files: ['**/*.{ts,tsx}'],
    extends: [tseslint.configs.strictTypeChecked],
    languageOptions: {
      parserOptions: {
        projectService: true,
        tsconfigRootDir: import.meta.dirname,
      },
    },
    rules: {
      '@typescript-eslint/ban-ts-comment': 'warn',
      '@typescript-eslint/no-empty-object-type': 'warn',
      '@typescript-eslint/no-explicit-any': 'error',
      '@typescript-eslint/no-floating-promises': 'error',
      // `void` and `() => setState()` are how call sites satisfy no-floating-promises
      // without changing what runs.
      '@typescript-eslint/no-confusing-void-expression': [
        'error',
        { ignoreArrowShorthand: true, ignoreVoidOperator: true },
      ],
      // Ids and HTTP statuses are numbers. Objects stay forbidden.
      '@typescript-eslint/restrict-template-expressions': [
        'error',
        { allowNumber: true, allowBoolean: true },
      ],
      // Generated Payload types mark fields required that drafts and partial API
      // rows still omit. Stripping those checks would change runtime behaviour.
      '@typescript-eslint/no-unnecessary-condition': 'off',
      '@typescript-eslint/no-unused-vars': [
        'error',
        {
          vars: 'all',
          args: 'after-used',
          ignoreRestSiblings: false,
          argsIgnorePattern: '^_',
          varsIgnorePattern: '^_',
          destructuredArrayIgnorePattern: '^_',
          caughtErrorsIgnorePattern: '^(_|ignore)',
        },
      ],
    },
  },
  {
    // The content seed and the test suite use assertions and non-null checks as
    // fixtures. Access rules stay untouched by assertion cleanups.
    files: ['scripts/**/*.ts', 'tests/**/*.{ts,tsx}', 'src/access/**/*.ts'],
    rules: {
      '@typescript-eslint/no-unnecessary-type-assertion': 'off',
      '@typescript-eslint/no-non-null-assertion': 'off',
      '@typescript-eslint/require-await': 'off',
    },
  },
  {
    // Test doubles and migration fixtures are intentionally loose. Production
    // source keeps the unsafe-* rules.
    files: ['tests/**/*.{ts,tsx}'],
    rules: {
      '@typescript-eslint/no-unsafe-assignment': 'off',
      '@typescript-eslint/no-unsafe-member-access': 'off',
      '@typescript-eslint/no-unsafe-call': 'off',
      '@typescript-eslint/no-unsafe-argument': 'off',
      '@typescript-eslint/no-unsafe-return': 'off',
      '@typescript-eslint/no-implied-eval': 'off',
      '@typescript-eslint/no-base-to-string': 'off',
    },
  },
  {
    ignores: [
      '.next/',
      '.open-next/',
      '.wrangler/',
      '.static-build-backup/',
      'out/',
      'cloudflare-env.d.ts',
      'src/migrations/',
      'src/payload-types.ts',
      'src/payload-generated-schema.ts',
    ],
  },
)

export default eslintConfig
