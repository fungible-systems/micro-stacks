import { ClientConfig } from './common/types';
import { MicroStacksClient } from './micro-stacks-client';

export let client: MicroStacksClient;

export type Client = typeof client;

export function createClient(options?: { config?: ClientConfig; client?: MicroStacksClient }) {
  if (options?.client) {
    client = options.client;
    return client;
  } else {
    client = new MicroStacksClient(options?.config);
    return client;
  }
}

export function getClient(options?: { config?: ClientConfig; client?: MicroStacksClient }) {
  if (!client) return createClient(options);
  return client;
}
