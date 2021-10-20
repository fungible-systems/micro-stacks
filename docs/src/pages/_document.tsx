import React from 'react';
import NextDocument, { Html, Head, Main, NextScript } from 'next/document';
import { getCssText } from '@nelson-ui/core';

export default class Document extends NextDocument {
  render() {
    return (
      <Html lang="en">
        <Head>
          <style id="stitches" dangerouslySetInnerHTML={{ __html: getCssText() }} />
          <style
            dangerouslySetInnerHTML={{
              __html: `@font-face {
  font-family: 'Neue Montreal';
  src: url('/fonts/PPNeueMontreal-Book.woff2') format('woff2'),
       url('/fonts/PPNeueMontreal-Book.woff') format('woff');
  font-weight: 300;
  font-display: swap;
  font-style: normal;
}
@font-face {
  font-family: 'Neue Montreal';
  src: url('/fonts/PPNeueMontreal-Regular.woff2') format('woff2'),
       url('/fonts/PPNeueMontreal-Regular.woff') format('woff');
  font-weight: regular;
  font-display: swap;
  font-style: normal;
}
@font-face {
  font-family: 'Neue Montreal';
  src: url('/fonts/PPNeueMontreal-Medium.woff2') format('woff2'),
       url('/fonts/PPNeueMontreal-Medium.woff') format('woff');
  font-weight: bold;
  font-display: swap;
  font-style: normal;
}
`,
            }}
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
