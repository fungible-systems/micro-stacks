module.exports = {
  parser: '@typescript-eslint/parser',
  parserOptions: {
    project: './tsconfig.json',
  },
  extends: '@fungible-systems/eslint-config',
  env: {
    browser: true,
    node: true,
    es6: true,
  },
  globals: {
    page: true,
    browser: true,
    context: true,
  },
  plugins: ['react-hooks', '@typescript-eslint'],
  rules: {
    'react-hooks/exhaustive-deps': ['warn'],
  },
};
