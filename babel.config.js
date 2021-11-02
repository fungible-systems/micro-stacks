module.exports = (api, targets) => {
  // https://babeljs.io/docs/en/config-files#config-function-api
  const isTestEnv = api.env('test');

  return {
    babelrc: false,
    ignore: ['./node_modules'],
    presets: [
      [
        '@babel/preset-env',
        {
          modules: isTestEnv ? 'commonjs' : false,
          targets: isTestEnv ? { node: 'current' } : targets,
          loose: false,
          useBuiltIns: false,
          exclude: [
            'transform-async-to-generator',
            'transform-regenerator',
            'transform-exponentiation-operator',
          ],
        },
      ],
    ],
    plugins: [
      '@babel/plugin-transform-typescript',
      '@babel/plugin-proposal-class-properties',
      '@babel/plugin-proposal-nullish-coalescing-operator',
    ],
  };
};
