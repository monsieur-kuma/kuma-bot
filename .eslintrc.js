module.exports = {
  env: {
    browser: true,
    es2021: true,
  },
  globals: {
    Logger: true,
    CustomObject: true,
    Container: true,
    Command: true,
    SlashCmd: true,
    Database: true,
    LevelCache: true,
  },
  extends: [
    'airbnb-base',
    'eslint:recommended',
    'plugin:import/recommended',
    'plugin:import/typescript',
    'plugin:prettier/recommended',
    'plugin:import/recommended',
    'prettier',
  ],
  parser: '@typescript-eslint/parser',
  parserOptions: {
    ecmaVersion: 'latest',
    sourceType: 'module',
  },
  plugins: ['@typescript-eslint', 'import', 'simple-import-sort', 'unused-imports', 'prettier'],
  rules: {
    'no-underscore-dangle': 0,
    'no-useless-escape': 0,
    'no-restricted-globals': 'warn',
    'no-unused-vars': 'off',
    'object-curly-newline': ['error', { consistent: true }],
    'comma-dangle': 'off',
    'no-param-reassign': ['error', { props: false }],
    '@typescript-eslint/comma-dangle': 0,
    indent: 'off',
    '@typescript-eslint/indent': 0,
    'simple-import-sort/imports': 'error',
    'simple-import-sort/exports': 'error',
    'unused-imports/no-unused-imports': 'error',
    'unused-imports/no-unused-vars': [
      'error',
      {
        vars: 'all',
        varsIgnorePattern: '^_',
        args: 'after-used',
        argsIgnorePattern: '^_',
      },
    ],
    'import/prefer-default-export': 0,
    'import/no-unresolved': 'error',
    'import/extensions': [
      'error',
      'ignorePackages',
      {
        js: 'never',
        jsx: 'never',
        ts: 'never',
        tsx: 'never',
      },
    ],
  },
  settings: {
    'import/parsers': {
      '@typescript-eslint/parser': ['.ts', '.tsx'],
    },
    'import/resolver': {
      typescript: {
        alwaysTryTypes: true,
        project: './tsconfig.json',
      },
    },
  },
};
