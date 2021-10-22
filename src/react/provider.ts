import { FC, createElement } from 'react';
import { defaultStorageAdapter } from 'micro-stacks/connect';
import { StacksNetwork, StacksMainnet, StacksTestnet, StacksMocknet } from 'micro-stacks/network';
import { Provider } from 'jotai';

import { authOptionsAtom } from './store/auth';
import { networkValueAtom } from './store/network';
import { storageAdapterAtom } from './store/storage-adapter';

import type { AuthOptions, StorageAdapter } from 'micro-stacks/connect';
import type { Atom } from 'jotai';

export const MicroStacksProvider: FC<{
  authOptions: AuthOptions;
  storageAdapter?: StorageAdapter<unknown>;
  network?: StacksNetwork | 'mainnet' | 'testnet' | 'mocknet';
  initialValues?: Iterable<readonly [Atom<unknown>, unknown]>;
}> = ({
  children,
  authOptions,
  storageAdapter = defaultStorageAdapter,
  network = new StacksMainnet(),
  initialValues = [],
}) => {
  const getNetwork = () => {
    if (network) {
      if (typeof network === 'string') {
        switch (network) {
          case 'mocknet':
            return new StacksMocknet();
          case 'testnet':
            return new StacksTestnet();
          case 'mainnet':
          default:
            return new StacksMainnet();
        }
      }
    }
    return network;
  };
  const networkValue = getNetwork();
  const microStacksInitialValues = [
    [authOptionsAtom, authOptions] as const,
    [storageAdapterAtom, storageAdapter] as const,
    [networkValueAtom, networkValue] as const,
    ...initialValues,
  ];
  return createElement(
    Provider,
    {
      initialValues: microStacksInitialValues,
    },
    children
  );
};
