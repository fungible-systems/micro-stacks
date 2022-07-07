import equalityFn from 'fast-deep-equal/es6/index.js';
import { State } from '../common/types';
import { getClient } from '../create-client';
import { MicroStacksClient } from '../micro-stacks-client';

export function getNetwork(client: MicroStacksClient = getClient()) {
  const { network } = client;
  return network;
}

export function watchNetwork(
  callback: (payload: State['network']) => void,
  client: MicroStacksClient = getClient()
) {
  const handleChange = () => callback(getNetwork(client));

  return client.subscribe(
    ({ network }) => {
      return network;
    },
    handleChange,
    { equalityFn }
  );
}
