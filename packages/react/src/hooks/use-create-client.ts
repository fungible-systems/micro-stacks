import { ClientConfig, createClient, MicroStacksClient, STORE_KEY } from '@micro-stacks/client';

function createAndHydrateClient(options?: {
  dehydratedState?: ClientConfig['dehydratedState'];
  config?: ClientConfig;
}): MicroStacksClient {
  const newClient = new MicroStacksClient(options?.config);

  if (options?.dehydratedState) {
    const dehydratedState =
      typeof options.dehydratedState === 'function'
        ? options.dehydratedState(STORE_KEY)
        : options.dehydratedState;

    if (dehydratedState) newClient.hydrate(dehydratedState);
  }
  return newClient;
}

export function useCreateClient(options?: {
  dehydratedState?: ClientConfig['dehydratedState'];
  config?: ClientConfig;
}): MicroStacksClient {
  // is SSR, always new
  if (typeof document === 'undefined') return createAndHydrateClient(options);
  return createClient({ config: options?.config });
}
