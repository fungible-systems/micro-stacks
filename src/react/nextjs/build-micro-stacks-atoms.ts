import { AppProviderAtomBuilder } from '../types';
import { InitialValuesAtomBuilder } from 'jotai-query-toolkit/nextjs';
import { getNetwork, MicroStacksProviderAtoms } from '../utils';
import { _isSignedInAtom, authOptionsAtom, partialStacksSessionAtom } from '../store/auth';
import { storageAdapterAtom } from '../store/storage-adapter';
import { defaultStorageAdapter } from 'micro-stacks/connect';
import { networkValueAtom } from '../store/network';
import { useCookiesAtom } from '../store/cookies';

/**
 * buildMicroStacksAtoms
 *
 * This is used with `jotai-query-toolkit` and next.js
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
 * @param options - {@link AppProviderAtomBuilder}
 */
export const buildMicroStacksAtoms = (
  options: AppProviderAtomBuilder
): InitialValuesAtomBuilder[] => {
  return [
    [
      MicroStacksProviderAtoms.AuthOptions,
      (value: AppProviderAtomBuilder['authOptions']) => [
        authOptionsAtom,
        value || options.authOptions,
      ],
    ],
    [
      MicroStacksProviderAtoms.StorageAdapter,
      (value: AppProviderAtomBuilder['storageAdapter']) => [
        storageAdapterAtom,
        value || options.storageAdapter || defaultStorageAdapter,
      ],
    ],
    [
      MicroStacksProviderAtoms.Network,
      (value: AppProviderAtomBuilder['network']) => [
        networkValueAtom,
        getNetwork(value || options.network),
      ],
    ],
    [
      MicroStacksProviderAtoms.PartialStacksSession,
      (value: AppProviderAtomBuilder['partialStacksSession']) => [
        partialStacksSessionAtom,
        value || options.partialStacksSession,
      ],
    ],
    [
      MicroStacksProviderAtoms.EnableCookies,
      value => [useCookiesAtom, typeof value === 'boolean' ? value : true],
    ],
    [
      MicroStacksProviderAtoms.IsSignedIn,
      value => [_isSignedInAtom, typeof value === 'boolean' ? value : false],
    ],
  ];
};
