import {
  getAccounts,
  getCurrentAccount,
  getDecentralizedID,
  getIdentityAddress,
  getStxAddress,
} from '@micro-stacks/client';

import { clientStateHookFactory } from '../common/utils';

/** ------------------------------------------------------------------------------------------------------------------
 *   State values
 *  ------------------------------------------------------------------------------------------------------------------
 */

const useWatchAccounts = clientStateHookFactory(getAccounts);
const useWatchAccount = clientStateHookFactory(getCurrentAccount);
const useIdentityAddress = clientStateHookFactory(getIdentityAddress);
const useDecentralizedID = clientStateHookFactory(getDecentralizedID);
const useWatchStxAddress = clientStateHookFactory(getStxAddress);

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
