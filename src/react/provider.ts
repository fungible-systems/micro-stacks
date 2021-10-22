import { createElement, FC, useMemo } from 'react';
import { Provider } from 'jotai';
import { defaultStorageAdapter } from 'micro-stacks/connect';
import { StacksMainnet } from 'micro-stacks/network';

import { authOptionsAtom } from './store/auth';
import { networkValueAtom } from './store/network';
import { storageAdapterAtom } from './store/storage-adapter';
import { getNetwork } from './utils';
import { MicroStacksProviderProps } from './types';

export const MicroStacksProvider: FC<MicroStacksProviderProps> = ({
  children,
  authOptions,
  storageAdapter = defaultStorageAdapter,
  network = new StacksMainnet(),
  initialValues: additionalInitialValues = [],
}) => {
  const networkValue = useMemo(() => getNetwork(network), [network]);

  const initialValues = useMemo(
    () => [
      [authOptionsAtom, authOptions] as const,
      [storageAdapterAtom, storageAdapter] as const,
      [networkValueAtom, networkValue] as const,
      ...additionalInitialValues,
    ],
    [authOptions, storageAdapter, networkValue, additionalInitialValues]
  );

  const props = useMemo(() => ({ initialValues }), [initialValues]);

  return createElement(Provider, props, children);
};
