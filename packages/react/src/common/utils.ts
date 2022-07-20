import { useMicroStacksClient } from '../hooks/use-client';
// import { useSyncExternalStoreWithSelector } from 'use-sync-external-store/shim/with-selector'
// This doesn't work in ESM, because use-sync-external-store only exposes CJS.
// See: https://github.com/pmndrs/valtio/issues/452
// The following is a workaround until ESM is supported.
import useSyncExternalStoreExports from 'use-sync-external-store/shim/with-selector';
import type { MicroStacksClient, State } from '@micro-stacks/client';

const { useSyncExternalStoreWithSelector } = useSyncExternalStoreExports;

/** ------------------------------------------------------------------------------------------------------------------
 *   Types
 *  ------------------------------------------------------------------------------------------------------------------
 */

type GetterFn<V> = (options: { client: MicroStacksClient; state?: State }) => V;

/** ------------------------------------------------------------------------------------------------------------------
 *   clientStateHookFactory
 *  ------------------------------------------------------------------------------------------------------------------
 */

export function clientStateHookFactory<V>(selector: GetterFn<V>): () => V {
  return () => {
    const client = useMicroStacksClient();
    return useSyncExternalStoreWithSelector(
      client.subscribe,
      client.getState,
      client.getState,
      state => selector({ client, state })
    );
  };
}
