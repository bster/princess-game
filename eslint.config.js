import eslintJs from '@eslint/js';
import eslintConfigPrettier from 'eslint-config-prettier';
import globals from 'globals';

export default [
  eslintJs.configs.recommended,
  eslintConfigPrettier,
  {
    files: ['www/**/*.js'],
    languageOptions: {
      ecmaVersion: 2022,
      sourceType: 'module',
      globals: {
        ...globals.browser,
      },
    },
    rules: {
      'no-unused-vars': ['warn', { argsIgnorePattern: '^_', caughtErrors: 'none' }],
    },
  },
  {
    ignores: ['dist/**', 'node_modules/**', 'ios/**'],
  },
];
