import { readable } from 'svelte/store';
import { getClient } from './store';

import type { MicroStacksClient } from '@micro-stacks/client';

type SubscriptionFn<V> = (setter: (value: V) => void, client: MicroStacksClient) => () => void;
type GetterFn<V> = (client: MicroStacksClient) => V;

export function readableClientState<V>(getter: GetterFn<V>, subscribe: SubscriptionFn<V>) {
  const client = getClient();
  return () =>
    readable(getter(client), set => {
      return subscribe(set, client);
    });
}
