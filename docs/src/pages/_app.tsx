import React from 'react';
import { AppConfig } from '@components/app-wrapper';
import type { AppProps } from 'next/app';
import 'modern-normalize/modern-normalize.css';
import '@common/prism.css';
import '@common/progress-bar.css';
import Head from 'next/head';

function App({ Component, pageProps }: AppProps) {
  return (
    <AppConfig>
      <Head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="true" />
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;700&display=swap"
          rel="stylesheet"
        />
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@400;600;700&family=Space+Grotesk&display=swap"
          rel="stylesheet"
        />
      </Head>
      <Component {...pageProps} />
    </AppConfig>
  );
}

export default App;
