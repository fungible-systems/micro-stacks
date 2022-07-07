import { MicroStacksClient } from '@micro-stacks/client';
import { useMicroStacksClient } from '../hooks/use-client';
import { useEffect, useState } from 'react';

/** ------------------------------------------------------------------------------------------------------------------
 *   Types
 *  ------------------------------------------------------------------------------------------------------------------
 */

type SubscriptionFn<V> = (setter: (value: V) => void, client: MicroStacksClient) => () => void;
type GetterFn<V> = (client: MicroStacksClient) => V;

/** ------------------------------------------------------------------------------------------------------------------
 *   clientStateHookFactory
 *  ------------------------------------------------------------------------------------------------------------------
 */

export function clientStateHookFactory<V>(
  getter: GetterFn<V>,
  subscribe: SubscriptionFn<V>
): () => V {
  // return the hook
  return () => {
    const client = useMicroStacksClient();
    const [state, setState] = useState<V>(getter(client));
    useEffect(() => {
      return subscribe(setState, client);
    }, [client]);

    return state;
  };
}
