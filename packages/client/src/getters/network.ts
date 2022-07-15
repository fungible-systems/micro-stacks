import equalityFn from 'fast-deep-equal/es6/index.js';
import { getClient } from '../create-client';
import type { State } from '../common/types';
import type { MicroStacksClient } from '../micro-stacks-client';

export const getNetwork = ({ client, state }: { client: MicroStacksClient; state?: State }) =>
  client.selectNetwork(state || client.getState());

export const watchNetwork = (
  callback: (payload: State['network']) => void,
  client: MicroStacksClient = getClient()
) => client.subscribe(client.selectNetwork, callback, { equalityFn });
