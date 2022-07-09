// theme.config.js

const BRANCH = 'feat/v1';

export default {
  projectLink: 'https://github.com/fungible-systems/micro-stacks',
  docsRepositoryBase: `https://github.com/fungible-systems/micro-stacks/tree/${BRANCH}/apps/docs/pages`,
  titleSuffix: ' – micro-stacks.dev',
  unstable_flexsearch: true,
  floatTOC: true,
  nextLinks: true,
  breadcrumb: true,
  prevLinks: false,
  search: true,
  customSearch: null, // customizable, you can use algolia for example
  darkMode: true,
  footer: true,
  footerText: `MIT ${new Date().getFullYear()} © Fungible Systems.`,
  footerEditLink: `Edit this page on GitHub`,
  logo: () => {
    // eslint-disable-next-line react-hooks/rules-of-hooks
    return (
      <>
        <span className="mr-2 font-extrabold">micro-stacks</span>
        <span className="text-gray-600 font-normal hidden md:inline">
          Building next generation Stacks apps
        </span>
      </>
    );
  },
  i18n: [{ locale: 'en-US', text: 'English' }],
  head: ({ title, meta }) => {
    const ogImage = 'https://micro-stacks.dev/og-image.png';
    return (
      <>
        {/* Favicons, meta */}
        <link rel="apple-touch-icon" sizes="180x180" href="/favicon/apple-touch-icon.png" />
        <link rel="icon" type="image/png" sizes="32x32" href="/favicon/favicon-32x32.png" />
        <link rel="icon" type="image/png" sizes="16x16" href="/favicon/favicon-16x16.png" />
        <link rel="icon" type="image/svg+xml" href="/favicon/favicon.svg" />
        <link rel="manifest" href="/favicon/site.webmanifest" />
        <link rel="mask-icon" href="/favicon/safari-pinned-tab.svg" color="#000000" />
        <meta name="msapplication-TileColor" content="#ffffff" />
        <meta httpEquiv="Content-Language" content="en" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <meta
          name="description"
          content={
            meta.description ||
            'micro-stacks is an all-in-one TypeScript SDK for interacting with the Stacks ecosystem.'
          }
        />
        <meta
          name="og:description"
          content={
            meta.description ||
            'micro-stacks is an all-in-one TypeScript SDK for interacting with the Stacks ecosystem.'
          }
        />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:site" content="@FungibleSystems" />
        <meta name="twitter:image" content={meta.image ?? ogImage} />
        <meta name="og:title" content={title ?? 'micro-stacks'} />
        <meta name="og:image" content={meta.image ?? ogImage} />
        <meta name="apple-mobile-web-app-title" content="micro-stacks" />
      </>
    );
  },
};
