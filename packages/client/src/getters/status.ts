import { State } from '../common/types';
import { getClient } from '../create-client';
import { MicroStacksClient } from '../micro-stacks-client';

export function getStatus(client: MicroStacksClient = getClient()) {
  const { statuses } = client;
  return statuses;
}

export function watchStatus(
  callback: (payload: State['statuses']) => void,
  client: MicroStacksClient = getClient()
) {
  const handleChange = () => callback(getStatus(client));
  return client.subscribe(
    ({ statuses }) => {
      return statuses;
    },
    handleChange,
    { equalityFn: (selected, previous) => selected === previous }
  );
}
