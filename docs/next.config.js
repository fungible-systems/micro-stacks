const { createVanillaExtractPlugin } = require('@vanilla-extract/next-plugin');
const withVanillaExtract = createVanillaExtractPlugin();

const remarkPlugins = [
  import('remark-external-links'),
  import('remark-squeeze-paragraphs'),
  import('remark-unwrap-images'),
];

module.exports = withVanillaExtract({
  pageExtensions: ['mdx', 'tsx', 'ts', 'jsx', 'js'],
  future: {
    esmExternals: true,
    turboMode: true,
  },
  webpack(config, { isServer }) {
    const fallback = config.resolve.fallback || (config.resolve.fallback = {});
    if (!isServer) {
      fallback['crypto'] = false;
      fallback['stream'] = false;
    }

    return config;
  },
});
