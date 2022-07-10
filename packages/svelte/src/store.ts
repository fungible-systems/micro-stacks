import { createClient, defaultStorage, getClient as _getClient } from '@micro-stacks/client';
import { get, writable } from 'svelte/store';
import { onAuthentication, onPersistState, onSignOut } from './events';

import type { ClientConfig, MicroStacksClient } from '@micro-stacks/client';

export const microStacksClientStore = writable<ReturnType<typeof _getClient> | null>();

export const mountClient = ({
  client: client_,
  dehydratedState,
  appIconUrl,
  appName,
  network,
  storage = defaultStorage,
  onPersistState: _onPersistState,
  onAuthentication: _onAuthentication,
  onSignOut: _onSignOut,
}: {
  client?: ReturnType<typeof _getClient>;
} & ClientConfig) => {
  const client = createClient({
    config: {
      appName,
      appIconUrl,
      dehydratedState,
      network,
      storage,
      onPersistState: _onPersistState,
      onAuthentication: _onAuthentication,
      onSignOut: _onSignOut,
    },
    client: client_,
  });

  microStacksClientStore.set(client);

  if (!client_) {
    onAuthentication(_onAuthentication);
    onSignOut(_onSignOut);
    onPersistState(_onPersistState);
  }
};

export const getClient = (): MicroStacksClient => {
  const client = get(microStacksClientStore);
  if (!client) {
    throw new Error('No MicroStacksClient set, mount the client in your app with `mountClient`');
  }
  return client;
};
