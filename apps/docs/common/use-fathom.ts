import * as Fathom from 'fathom-client';
import { useRouter } from 'next/router';
import { useEffect } from 'react';

function onRouteChangeComplete(fathom: typeof Fathom) {
  fathom.trackPageview();
}

export const useFathom = () => {
  const router = useRouter();

  useEffect(() => {
    if (process.env.NODE_ENV !== 'development' && typeof document !== 'undefined') {
      Fathom.load('QDJGDBFP', {
        includedDomains: ['micro-stacks.dev'],
        url: 'https://marmoset.fungible.systems/script.js',
      });

      const handleRouteChange = () => onRouteChangeComplete(Fathom);

      router.events.on('routeChangeComplete', handleRouteChange);

      return () => {
        router.events.off('routeChangeComplete', handleRouteChange);
      };
    }
  }, [router.events]);
};
