import { ClientConfig } from './common/types';
import { MicroStacksClient } from './micro-stacks-client';
import { IS_SSR } from './common/constants';

/** ------------------------------------------------------------------------------------------------------------------
 *   Types
 *  ------------------------------------------------------------------------------------------------------------------
 */

export type Client = typeof client;

interface Options {
  config?: ClientConfig;
  client?: MicroStacksClient;
}

/** ------------------------------------------------------------------------------------------------------------------
 *   Shared client
 *  ------------------------------------------------------------------------------------------------------------------
 */

export let client: MicroStacksClient;

/** ------------------------------------------------------------------------------------------------------------------
 *   createClient
 *  ------------------------------------------------------------------------------------------------------------------
 */

export function createClient(options?: Options) {
  const newClient = options?.client ?? new MicroStacksClient(options?.config);

  // always return new client on server
  if (IS_SSR) return newClient;

  client = newClient;
  return client;
}

/** ------------------------------------------------------------------------------------------------------------------
 *   getClient
 *  ------------------------------------------------------------------------------------------------------------------
 */

export function getClient(options?: Options) {
  // always return new client on server
  if (IS_SSR) return createClient(options);
  return client ?? createClient(options);
}
