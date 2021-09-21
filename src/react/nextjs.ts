import { AuthOptions, defaultStorageAdapter, StorageAdapter } from 'micro-stacks/connect';
import { StacksMainnet, StacksNetwork, StacksTestnet } from 'micro-stacks/network';
import { InitialValuesAtomBuilder } from 'jotai-query-toolkit/nextjs';
import { authOptionsAtom } from './store/auth';
import { storageAdapterAtom } from './store/storage-adapter';
import { networkValueAtom } from './store/network';

const getNetwork = (value?: StacksNetwork | 'mainnet' | 'testnet') => {
  if (value) {
    if (typeof value === 'string') {
      switch (value) {
        case 'testnet':
          return new StacksTestnet();
        case 'mainnet':
      }
    } else {
      return value;
    }
  }
  return new StacksMainnet();
};

interface AppProviderAtomBuilder {
  /** Web wallet authOptions */
  authOptions: AuthOptions;
  /** a custom storage adapter */
  storageAdapter?: StorageAdapter<unknown>;
  /** the network for the app (testnet | mainnet) */
  network?: StacksNetwork | 'mainnet' | 'testnet';
}

/**
 * appProviderAtomBuilder
 *
 * This is used with `jotai-query-tookit` and next.js
 * This is a method to create InitialValuesAtomBuilder for `withInitialQueries`
 * Use this in place of `MicroStacksProvider`
 * @example
 *
 * ```tsx
 * const providerAtoms = appProviderAtomBuilder({
 *   network: "testnet",
 *   authOptions: {
 *     appDetails: {
 *       name: "micro-stacks <> next.js",
 *       icon: "/",
 *     },
 *   },
 * });
 * const queries: GetQueries<any> = () => [["some-key", () => "someQueryFn"]];
 * export default withInitialQueries(NextjsPageComponent, providerAtoms)(queries);
 *
 * ```
 * @param options - {@link AppProviderAtomBuilder}
 */
export const appProviderAtomBuilder = ({
  network,
  storageAdapter = defaultStorageAdapter,
  authOptions,
}: AppProviderAtomBuilder): InitialValuesAtomBuilder[] => {
  return [
    ['authOptions', value => [authOptionsAtom, value || authOptions]],
    ['storageAdapter', value => [storageAdapterAtom, value || storageAdapter]],
    ['network', value => [networkValueAtom, getNetwork(value || network)]],
  ];
};
