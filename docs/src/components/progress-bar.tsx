import * as React from 'react';
import Router from 'next/router';
import NProgress from 'nprogress';

export const useProgressBar = () => {
  const start = NProgress.start;
  const done = NProgress.done;

  return {
    start,
    done,
  };
};

export const ProgressBar = () => {
  React.useEffect(() => {
    Router.events.on('routeChangeStart', url => {
      NProgress.start();
    });
    Router.events.on('routeChangeComplete', () => NProgress.done());
    Router.events.on('routeChangeError', () => NProgress.done());
  }, []);
  return <></>;
};
