import { FC, createElement, useMemo } from 'react';
import { defaultStorageAdapter } from 'micro-stacks/connect';
import { StacksNetwork, StacksMainnet, StacksTestnet, StacksMocknet } from 'micro-stacks/network';
import { Provider } from 'jotai';

import { authOptionsAtom } from './store/auth';
import { networkValueAtom } from './store/network';
import { storageAdapterAtom } from './store/storage-adapter';

import type { AuthOptions, StorageAdapter } from 'micro-stacks/connect';
import type { Atom } from 'jotai';

type NetworkType = StacksNetwork | 'mainnet' | 'testnet' | 'mocknet';

function getNetwork(network?: NetworkType) {
  if (!network) return;
  switch (network) {
    case 'mocknet':
      return new StacksMocknet();
    case 'testnet':
      return new StacksTestnet();
    case 'mainnet':
      return new StacksMainnet();
    default:
      return network;
  }
}

interface MicroStacksProviderProps {
  authOptions: AuthOptions;
  storageAdapter?: StorageAdapter<unknown>;
  network?: NetworkType;
  initialValues?: Iterable<readonly [Atom<unknown>, unknown]>;
}

export const MicroStacksProvider: FC<MicroStacksProviderProps> = ({
  children,
  authOptions,
  storageAdapter = defaultStorageAdapter,
  network = new StacksMainnet(),
  initialValues = [],
}) => {
  const networkValue = useMemo(() => getNetwork(network), [network]);

  const microStacksInitialValues = useMemo(
    () => [
      [authOptionsAtom, authOptions] as const,
      [storageAdapterAtom, storageAdapter] as const,
      [networkValueAtom, networkValue] as const,
      ...initialValues,
    ],
    [authOptions, storageAdapter, networkValue, initialValues]
  );

  return createElement(
    Provider,
    {
      initialValues: microStacksInitialValues,
    },
    children
  );
};
