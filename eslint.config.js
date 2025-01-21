// @ts-check

import eslint from '@eslint/js'
import stylistic from '@stylistic/eslint-plugin'
import perfectionist from 'eslint-plugin-perfectionist'
import * as wdio from 'eslint-plugin-wdio'
import globals from 'globals'
import tseslint from 'typescript-eslint'

export default tseslint.config(
  eslint.configs.recommended,
  tseslint.configs.strictTypeChecked,
  tseslint.configs.stylisticTypeChecked,
  stylistic.configs.customize({
    flat: true,
    jsx: false,
    indent: 2,
    quotes: 'single',
    semi: false,
    commaDangle: 'always-multiline',
    braceStyle: '1tbs',
    quoteProps: 'as-needed',
  }),
  {
    rules: {
      '@stylistic/curly-newline': ['error', { consistent: true }],
      '@stylistic/max-len': ['error', { code: 100, ignoreUrls: true, ignoreComments: true }],
      '@stylistic/array-bracket-newline': ['error', 'consistent'],
      '@stylistic/array-element-newline': ['error', 'consistent'],
      '@stylistic/function-call-argument-newline': ['error', 'consistent'],
      '@stylistic/no-confusing-arrow': 'error',
      '@stylistic/nonblock-statement-body-position': 'error',
      '@stylistic/object-property-newline': ['error', { allowAllPropertiesOnSameLine: true }],
      '@stylistic/padding-line-between-statements': 'error',
      '@stylistic/switch-colon-spacing': 'error',
    },
  },
  {
    plugins: {
      perfectionist,
    },
    rules: {
      'perfectionist/sort-imports': ['error', {
        type: 'natural',
        order: 'asc',
        ignoreCase: false,
        newlinesBetween: 'always',
        environment: 'node',
        groups: [
          'type',
          'builtin',
          'external',
          'internal-type',
          'internal',
          ['parent-type', 'sibling-type', 'index-type'],
          ['parent', 'sibling', 'index'],
          'object',
          'unknown',
        ],
      }],
      'perfectionist/sort-named-imports': ['error', { order: 'asc', type: 'alphabetical' }],
    },
  },
  {
    files: ['**/*.ts'],
    languageOptions: {
      parserOptions: {
        projectService: true,
        tsconfigRootDir: import.meta.dirname,
      },
    },
  },
  {
    files: ['**/*.js'],
    extends: [
      tseslint.configs.disableTypeChecked,
    ],
    languageOptions: {
      ecmaVersion: 'latest',
      globals: { ...globals.node },
      sourceType: 'module',
    },
  },
  {
    files: ['e2e/**/*.ts'],
    extends: [wdio.configs['flat/recommended']],
    rules: {
      '@typescript-eslint/no-non-null-assertion': 'off',
    },
  },
  {
    ignores: ['out/*'],
  },
)
