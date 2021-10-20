import React, { memo } from 'react';
import { ProgressBar } from '@components/progress-bar';
import Head from 'next/head';
import { PageWrapper } from '@components/page-wrapper';
import { useRouter } from 'next/router';

export const AppConfig: React.FC = memo(({ children }) => {
  const router = useRouter();
  const isHome = router.pathname === '/';
  return (
    <>
      <ProgressBar />
      <Head>
        <title>Docs starter kit</title>
      </Head>
      <PageWrapper isHome={isHome}>{children}</PageWrapper>
    </>
  );
});
