import js from '@eslint/js';
import { FlatCompat } from '@eslint/eslintrc';
import * as path from 'path';
import { fileURLToPath } from 'url';
import globals from 'globals';
import tseslint from 'typescript-eslint';
import prettierConfig from 'eslint-config-prettier';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const compat = new FlatCompat({
  baseDirectory: __dirname,
});

export default [
  js.configs.recommended,
  ...tseslint.configs.recommended,
  ...compat.extends(
    'plugin:react-hooks/recommended',
    'plugin:react/recommended',
    'plugin:react/jsx-runtime'
  ),
  prettierConfig,
  {
    ignores: [
      '**/dist/**',
      '**/node_modules/**',
      '**/vendor/**',
      '**/.vite/**',
      '**/build/**',
      '**/*.config.js',
      '**/*.config.ts',
    ],
  },
  {
    files: ['**/*.{ts,tsx}'],
    languageOptions: {
      ecmaVersion: 'latest',
      sourceType: 'module',
      globals: {
        ...globals.browser,
        ...globals.es2021,
        ...globals.node,
        chrome: true,
        window: true,
        document: true,
        localStorage: true,
        sessionStorage: true,
        fetch: true,
        Response: true,
        Request: true,
        Headers: true,
        console: true,
        setTimeout: true,
        clearTimeout: true,
        setInterval: true,
        clearInterval: true,
        URL: true,
        URLSearchParams: true,
        process: true,
        __dirname: true,
        __filename: true,
        global: true,
        navigator: true,
        location: true,
        history: true,
        Element: true,
        HTMLElement: true,
        Node: true,
        DocumentFragment: true,
        Text: true,
        Comment: true,
        Event: true,
        CustomEvent: true,
        MouseEvent: true,
        KeyboardEvent: true,
        MutationObserver: true,
        ResizeObserver: true,
        WebSocket: true,
        XMLHttpRequest: true,
        self: true,
      },
      parserOptions: {
        ecmaFeatures: {
          jsx: true,
        },
      },
    },
    linterOptions: {
      reportUnusedDisableDirectives: true,
      noInlineConfig: true,
    },
    plugins: {
      'react-refresh': await import('eslint-plugin-react-refresh'),
    },
    rules: {
      'react-refresh/only-export-components': ['warn', { allowConstantExport: true }],
      '@typescript-eslint/no-unused-vars': ['warn'],
      'react/prop-types': 'off',
      'no-warning-comments': 'warn',
      'no-console': 'off',
      'react/jsx-no-target-blank': ['error', {
        enforceDynamicLinks: 'always',
        warnOnSpreadAttributes: true,
        forms: true,
        links: true
      }],
      '@typescript-eslint/no-unused-expressions': 'off',
      'no-constant-binary-expression': 'off',
      'no-undef': 'off', // TypeScript handles this
    },
    settings: {
      react: {
        version: 'detect',
      },
    },
  },
];
