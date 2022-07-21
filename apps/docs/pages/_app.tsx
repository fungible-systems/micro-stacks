import 'nextra-theme-docs/style.css';
import '../common/global.css';
import { useFathom } from '../common/use-fathom';
import { ClientProvider } from '@micro-stacks/react';
import { useCallback } from 'react';
import { destroySession, saveSession } from '../common/fetchers';

import type { AppContext, AppProps } from 'next/app';
import type { ClientConfig } from '@micro-stacks/client';
import App from 'next/app';
import { getDehydratedStateFromSession } from '../common/session-helpers';

export default function Nextra({
  Component,
  pageProps,
  dehydratedState,
}: AppProps & { dehydratedState: null | string }) {
  useFathom();
  const onPersistState: ClientConfig['onPersistState'] = useCallback(async (d: string) => {
    await saveSession(d);
  }, []);

  const onSignOut: ClientConfig['onSignOut'] = useCallback(async () => {
    await destroySession();
  }, []);

  const getLayout = (Component as any).getLayout || (page => page);
  return (
    <ClientProvider
      appName={'micro-stacks.dev'}
      appIconUrl={'/icon.png'}
      dehydratedState={dehydratedState}
      onPersistState={onPersistState}
      onSignOut={onSignOut}
    >
      {getLayout(<Component {...pageProps} />)}
    </ClientProvider>
  );
}

Nextra.getInitialProps = async (appContext: AppContext) => {
  // calls page's `getInitialProps` and fills `appProps.pageProps`
  const appProps = await App.getInitialProps(appContext);

  return {
    ...appProps,
    dehydratedState: await getDehydratedStateFromSession(appContext.ctx as any),
  };
};
