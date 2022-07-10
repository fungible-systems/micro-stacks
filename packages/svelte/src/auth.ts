import { Status, StatusKeys } from '@micro-stacks/client';
import { derived } from 'svelte/store';
import { getAccount } from './account';
import { watchStatuses } from './status';
import { useMicroStacksClient } from './context';

/** ------------------------------------------------------------------------------------------------------------------
 *   Derived state
 *  ------------------------------------------------------------------------------------------------------------------
 */

export function getAuth() {
  const client = useMicroStacksClient();

  return derived([getAccount(), watchStatuses()], ([$account, $status]) => {
    return {
      /**
       * actions
       */
      openAuthRequest: client.authenticate,
      signOut: client.signOut,
      /**
       * state
       */
      isSignedIn: !!$account.stxAddress,
      isRequestPending: $status[StatusKeys.Authentication] === Status.IsLoading
    };
  });
}
