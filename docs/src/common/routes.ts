export const routes = [
  {
    label: 'Getting Started',
    pages: [
      { title: 'Introduction', slug: 'docs/introduction' },
      { title: 'Installation', slug: 'docs/installation' },
      { title: 'Module overview', slug: 'docs/module-overview' },
    ],
  },
  {
    label: 'Core modules',
    pages: [
      { title: 'Clarity', slug: 'docs/core/clarity' },
      { title: 'Connect', slug: 'docs/core/connect' },
      { title: 'Crypto', slug: 'docs/core/crypto' },
      { title: 'Network', slug: 'docs/core/network' },
      { title: 'Storage', slug: 'docs/core/storage' },
      { title: 'Transactions', slug: 'docs/core/transactions' },
    ],
  },
  {
    label: 'React',
    pages: [
      { title: 'Overview', slug: 'docs/react/overview' },
      { title: 'Authentication', slug: 'docs/react/authentication' },
      { title: 'External data', slug: 'docs/react/external-data' },
      { title: 'Transactions', slug: 'docs/react/transactions' },
      { title: 'Storage', slug: 'docs/react/gaia-storage' },
      { title: 'SSR/next.js', slug: 'docs/react/ssr-next-js' },
    ],
  },
  {
    label: 'Extra modules',
    pages: [
      { title: 'BIP 32', slug: 'docs/extra/bip32' },
      { title: 'BIP 39', slug: 'docs/extra/bip39' },
      { title: 'Common', slug: 'docs/breakpoints' },
      { title: 'Wallet SDK', slug: 'docs/server-side-rendering' },
      { title: 'Zone file', slug: 'docs/utils' },
    ],
  },
];

export const allRoutes = routes.reduce((acc, curr) => {
  acc = [...acc, ...curr.pages];
  return acc;
}, []);
