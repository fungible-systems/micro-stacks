import {
  getAccounts,
  getCurrentAccount,
  getDecentralizedID,
  getIdentityAddress,
  getStxAddress,
  watchAccounts,
  watchCurrentAccount,
  watchDecentralizedID,
  watchIdentityAddress,
  watchStxAddress,
} from '@micro-stacks/client';

import { clientStateHookFactory } from '../common/utils';

/** ------------------------------------------------------------------------------------------------------------------
 *   State values
 *  ------------------------------------------------------------------------------------------------------------------
 */

const useWatchAccounts = clientStateHookFactory(getAccounts, watchAccounts);
const useWatchAccount = clientStateHookFactory(getCurrentAccount, watchCurrentAccount);
const useIdentityAddress = clientStateHookFactory(getIdentityAddress, watchIdentityAddress);
const useDecentralizedID = clientStateHookFactory(getDecentralizedID, watchDecentralizedID);
const useWatchStxAddress = clientStateHookFactory(getStxAddress, watchStxAddress);

/** ------------------------------------------------------------------------------------------------------------------
 *   useAccount hook (derived state)
 *  ------------------------------------------------------------------------------------------------------------------
 */

function useAccount() {
  const account = useWatchAccount();
  const stxAddress = useWatchStxAddress();
  const identityAddress = useIdentityAddress();
  const decentralizedID = useDecentralizedID();

  return {
    appPrivateKey: account?.appPrivateKey ?? null,
    rawAddress: account?.address,
    identityAddress,
    decentralizedID,
    stxAddress,
    profileUrl: account?.profile_url,
  };
}

function useIsGaiaAvailable() {
  return !!useAccount().appPrivateKey;
}

export {
  useAccount,
  useWatchStxAddress as useCurrentStxAddress,
  useWatchAccounts as useAccountsRaw,
  useIsGaiaAvailable,
};
