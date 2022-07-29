<script lang="ts">
  import {setContext} from 'svelte';
  import {createClient, defaultStorage} from '@micro-stacks/client';
  import {CLIENT_CONTEXT} from '../common';
  import type {ClientConfig, MicroStacksClient} from '@micro-stacks/client';

  export let appName: ClientConfig['appName'] = undefined;
  export let appIconUrl: ClientConfig['appIconUrl'] = undefined;
  export let storage: ClientConfig['storage'] = defaultStorage;
  export let network: ClientConfig['network'] = undefined;
  export let dehydratedState: ClientConfig['dehydratedState'] = undefined;
  export let onPersistState: ClientConfig['onPersistState'] = undefined;
  export let onSignOut: ClientConfig['onSignOut'] = undefined;
  export let onAuthentication: ClientConfig['onAuthentication'] = undefined;
  export let onNoWalletFound: ClientConfig['onNoWalletFound'] = undefined;
  export let gaiaConfig: ClientConfig['gaiaConfig'] = undefined;
  export let fetcher: ClientConfig['fetcher'] = undefined;
  export let client: MicroStacksClient | undefined = undefined;

  setContext(CLIENT_CONTEXT, createClient({
    client,
    config: {
      appName,
      appIconUrl,
      storage,
      network,
      dehydratedState,
      onPersistState,
      onSignOut,
      onAuthentication,
      onNoWalletFound,
      gaiaConfig,
      fetcher
    }
  }));
</script>

<slot/>
