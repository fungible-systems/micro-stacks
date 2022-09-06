import type { SvelteComponentTyped } from 'svelte';
import type { ClientConfig, MicroStacksClient } from '@micro-stacks/client';

class ClientProvider extends SvelteComponentTyped<{
  appName?: ClientConfig['appName'];
  appIconUrl?: ClientConfig['appIconUrl'];
  storage?: ClientConfig['storage'];
  network?: ClientConfig['network'];
  enableNetworkSwitching?: ClientConfig['enableNetworkSwitching'];
  dehydratedState?: ClientConfig['dehydratedState'];
  onPersistState?: ClientConfig['onPersistState'];
  onSignOut?: ClientConfig['onSignOut'];
  onAuthentication?: ClientConfig['onAuthentication'];
  onNoWalletFound?: ClientConfig['onNoWalletFound'];
  fetcher?: ClientConfig['fetcher'];
  client?: MicroStacksClient;
}> {}

export { ClientProvider as default };
