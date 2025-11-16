// eslint.config.js
import { createRequire } from 'node:module';
import js from '@eslint/js';
import prettier from 'eslint-config-prettier';

const require = createRequire(import.meta.url);
const importPlugin = require('eslint-plugin-import');

export default [
  js.configs.recommended,
  importPlugin.flatConfigs.recommended,
  importPlugin.flatConfigs.errors,
  prettier,
  {
    files: ['**/*.{js,mjs,cjs}'],
    languageOptions: {
      ecmaVersion: 2022,
      sourceType: 'module',
      globals: {
        console: 'readonly', process: 'readonly', Buffer: 'readonly',
        __dirname: 'readonly', __filename: 'readonly',
        exports: 'writable', module: 'writable', require: 'readonly',
        global: 'readonly',
      },
    },
    rules: {
      'no-unused-vars': 'warn',
      'no-undef': 'error',
      'import/order': [
        'warn',
        {
          'newlines-between': 'always',
          alphabetize: { order: 'asc' },
          groups: ['builtin', 'external', 'internal', 'parent', 'sibling', 'index'],
        },
      ],
    },
  },
  { ignores: ['dist/**', 'coverage/**', 'node_modules/**'] },
];