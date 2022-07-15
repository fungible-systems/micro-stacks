import { getClient } from '../create-client';
import type { State } from '../common/types';
import type { MicroStacksClient } from '../micro-stacks-client';

export const getStatus = ({ client, state }: { client: MicroStacksClient; state?: State }) =>
  client.selectStatuses(state || client.getState());

export const watchStatus = (
  callback: (payload: State['statuses']) => void,
  client: MicroStacksClient = getClient()
) =>
  client.subscribe(client.selectStatuses, callback, {
    equalityFn: (selected, previous) => selected === previous,
  });
