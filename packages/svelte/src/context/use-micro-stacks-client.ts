import { getContext } from 'svelte';
import type { MicroStacksClient } from '@micro-stacks/client';

export const useMicroStacksClient = (): MicroStacksClient => {
  const client = getContext<MicroStacksClient | undefined>('micro-stacks-client');
  if (!client) {
    throw new Error(
      'No MicroStacksClient set, mount the client in your app by wrapping your app in `ClientProvider`'
    );
  }
  return client;
};
