module.exports = {
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
};
