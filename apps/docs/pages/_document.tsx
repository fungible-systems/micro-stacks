import React from 'react';
import NextDocument, { Html, Head, Main, NextScript } from 'next/document';
import { getSandpackCssText } from '@codesandbox/sandpack-react';

export default class Document extends NextDocument {
  render() {
    return (
      <Html lang="en">
        <Head>
          <link
            rel="preconnect"
            href="https://fonts.googleapis.com"
          />
          <link
            rel="preconnect"
            href="https://fonts.gstatic.com"
            crossOrigin={'true`'}
          />
          <link
            rel="preconnect"
            href="https://fungible.systems"
            crossOrigin={'true`'}
          />
          <link
            href="https://fonts.googleapis.com/css2?family=Fira+Code&display=swap"
            rel="stylesheet"
          />
          <style
            dangerouslySetInnerHTML={{ __html: getSandpackCssText() }}
            id="sandpack"
          />
        </Head>
        <body>
          <Main />
          <NextScript />
        </body>
      </Html>
    );
  }
}
