import { authOptionsAtom } from './store/auth';
import { storageAdapterAtom } from './store/storage-adapter';
import { networkValueAtom } from './store/network';
import { getNetwork, MicroStacksProviderAtoms } from './utils';
import type { AppProviderAtomBuilder } from './types';
import type { InitialValuesAtomBuilder } from 'jotai-query-toolkit/nextjs';

/**
 * buildMicroStacksAtoms
 *
 * This is used with `jotai-query-tookit` and next.js
 * This is a method to create InitialValuesAtomBuilder for `withInitialQueries`
 * Use this in place of `MicroStacksProvider`
 * @example
 *
 * ```tsx
 * const providerAtoms = buildMicroStacksAtoms({
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
 * @param authOptions - {@link AppProviderAtomBuilder['authOptions']}
 * @param network - {@link AppProviderAtomBuilder}
 * @param storageAdapter - {@link AppProviderAtomBuilder}
 */
export const buildMicroStacksAtoms = (
  authOptions?: AppProviderAtomBuilder['authOptions'],
  network?: AppProviderAtomBuilder['network'],
  storageAdapter?: AppProviderAtomBuilder['storageAdapter']
): InitialValuesAtomBuilder[] => {
  return [
    [
      MicroStacksProviderAtoms.AuthOptions,
      (value: AppProviderAtomBuilder['authOptions']) => [authOptionsAtom, value || authOptions],
    ],
    [
      MicroStacksProviderAtoms.StorageAdapter,
      (value: AppProviderAtomBuilder['storageAdapter']) => [
        storageAdapterAtom,
        value || storageAdapter,
      ],
    ],
    [
      MicroStacksProviderAtoms.Network,
      (value: AppProviderAtomBuilder['network']) => [
        networkValueAtom,
        getNetwork(value || network),
      ],
    ],
  ];
};
