import { FC, createElement } from 'react';
import { defaultStorageAdapter } from 'micro-stacks/connect';
import { StacksNetwork, StacksMainnet, StacksTestnet, StacksRegtest, StacksMocknet } from 'micro-stacks/network';
import { Provider } from 'jotai';

import { authOptionsAtom } from './store/auth';
import { networkValueAtom } from './store/network';
import { storageAdapterAtom } from './store/storage-adapter';

import type { AuthOptions, StorageAdapter } from 'micro-stacks/connect';

export const MicroStacksProvider: FC<{
  authOptions: AuthOptions;
  storageAdapter?: StorageAdapter<unknown>;
  network?: StacksNetwork | 'mainnet' | 'testnet' | 'regtest' | 'mocknet';
}> = ({
  children,
  authOptions,
  storageAdapter = defaultStorageAdapter,
  network = new StacksMainnet(),
}) => {
  const getNetwork = () => {
    if (network) {
      if (typeof network === 'string') {
        switch (network) {
          case 'mocknet':
            return new StacksMocknet();
          case 'regtest':
            return new StacksRegtest();
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
  const initialValues = [
    [authOptionsAtom, authOptions] as const,
    [storageAdapterAtom, storageAdapter] as const,
    [networkValueAtom, networkValue] as const,
  ];
  return createElement(
    Provider,
    {
      initialValues,
    },
    children
  );
};
