import { AuthOptions, defaultStorageAdapter } from 'micro-stacks/connect';
import { NextPage } from 'next';
import { withInitialQueryData } from 'jotai-query-toolkit/nextjs';
import { AppProviderAtomBuilder } from '../types';
import { setSessionCookies } from './cookies';
import { buildMicroStacksAtoms } from './build-micro-stacks-atoms';

export function wrapWithMicroStacks(options: AppProviderAtomBuilder) {
  const authOptions: AuthOptions = {
    ...options.authOptions,
    onFinish(payload) {
      options?.authOptions?.onFinish?.(payload);
      setSessionCookies(payload);
    },
  };
  return (page: NextPage) =>
    withInitialQueryData(
      page,
      buildMicroStacksAtoms({
        authOptions,
        network: options.network,
        storageAdapter: options.storageAdapter || defaultStorageAdapter,
      })
    );
}
