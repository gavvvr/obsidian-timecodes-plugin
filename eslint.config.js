// @ts-check

import eslint from '@eslint/js'
import globals from 'globals'
import tseslint from 'typescript-eslint'

export default tseslint.config(
  eslint.configs.recommended,
  tseslint.configs.strictTypeChecked,
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
    ignores: ['out/*'],
  },
)
