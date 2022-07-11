<script lang="ts">
  import { setContext } from 'svelte';
  import {
    ClientConfig,
    createClient,
    defaultStorage,
    MicroStacksClient
  } from '@micro-stacks/client';
  import { CLIENT_CONTEXT } from '../common';

  export let appName: ClientConfig['appName'] = undefined;
  export let appIconUrl: ClientConfig['appIconUrl'] = undefined;
  export let storage: ClientConfig['storage'] = defaultStorage;
  export let network: ClientConfig['network'] = undefined;
  export let dehydratedState: ClientConfig['dehydratedState'] = undefined;
  export let onPersistState: ClientConfig['onPersistState'] = undefined;
  export let onSignOut: ClientConfig['onSignOut'] = undefined;
  export let onAuthentication: ClientConfig['onAuthentication'] = undefined;
  export let fetcher: ClientConfig['fetcher'] = undefined;
  export let client: MicroStacksClient | undefined = undefined;

  const config = {
    appName,
    appIconUrl,
    storage,
    network,
    dehydratedState,
    onPersistState,
    onSignOut,
    onAuthentication,
    fetcher
  };

  const _client = createClient({
    client,
    config
  });

  setContext(CLIENT_CONTEXT, _client);
</script>

<slot/>
