// next.config.js
const { getHighlighter, BUNDLED_LANGUAGES } = require('shiki');
const fs = require('fs');

const grammar = fs.readFileSync(require.resolve('./common/clarity-tmlanguage.json'), 'utf-8');

const rehypePrettyCodeOptions = {
  getHighlighter: options => {
    return getHighlighter({
      ...options,
      langs: [
        ...BUNDLED_LANGUAGES,
        {
          id: 'clarity',
          scopeName: 'source.clar',
          grammar: JSON.parse(grammar),
          aliases: ['clar', 'clarity'],
        },
      ],
    });
  },
};
/** @type {import('nextra').NextraConfig} */
const config = {
  theme: 'nextra-theme-docs',
  themeConfig: './theme.config.js',
  unstable_flexsearch: true,
  unstable_staticImage: true,
  mdxOptions: {
    rehypePrettyCodeOptions,
  },
};

const withNextra = require('nextra')(config);

module.exports = withNextra({
  i18n: {
    locales: ['en-US'],
    defaultLocale: 'en-US',
    localeDetection: false,
  },
  reactStrictMode: true,
  experimental: {
    legacyBrowsers: false,
    browsersListForSwc: true,
  },
  webpack(config, { isServer }) {
    const fallback = config.resolve.fallback || (config.resolve.fallback = {});
    if (!isServer) fallback['crypto'] = fallback['stream'] = false;
    return config;
  },
});
