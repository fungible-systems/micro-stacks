import { useAccount } from './use-account';
import { useStatuses } from './use-statuses';
import { useMicroStacksClient } from './use-client';
import { Client, Status, StatusKeys } from '@micro-stacks/client';

/** ------------------------------------------------------------------------------------------------------------------
 *   Types
 *  ------------------------------------------------------------------------------------------------------------------
 */

interface UseAuth {
  openAuthRequest: Client['authenticate'];
  signOut: Client['signOut'];
  isSignedIn: boolean;
  isRequestPending: boolean;
}

/** ------------------------------------------------------------------------------------------------------------------
 *   useAuth hook (derived + actions)
 *  ------------------------------------------------------------------------------------------------------------------
 */

export const useAuth = (): UseAuth => {
  const client = useMicroStacksClient();
  const { stxAddress } = useAccount();
  const status = useStatuses();
  return {
    /**
     * actions
     */
    openAuthRequest: client.authenticate,
    signOut: client.signOut,
    /**
     * state
     */
    isSignedIn: !!stxAddress,
    isRequestPending: status[StatusKeys.Authentication] === Status.IsLoading,
  };
};
