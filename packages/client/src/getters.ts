import { MicroStacksClient } from './micro-stacks-client';
import { getClient } from './create-client';
import equalityFn from 'fast-deep-equal/es6';
import { Account, State } from './common/types';

interface Options {
  client: MicroStacksClient;
  state?: State;
}

/** ------------------------------------------------------------------------------------------------------------------
 *   getters
 *  ------------------------------------------------------------------------------------------------------------------
 */
export const getAccounts = ({ client, state }: Options) =>
  client.selectAccounts(state || client.getState());

export const getCurrentAccount = ({ client, state }: Options) =>
  client.selectAccount(state || client.getState());

export const getStxAddress = ({ client, state }: Options) =>
  client.selectStxAddress(state || client.getState());

export const getIdentityAddress = ({ client, state }: Options) =>
  client.selectIdentityAddress(state || client.getState());

export const getDecentralizedID = ({ client, state }: Options) =>
  client.selectDecentralizedID(state || client.getState());

export const getNetwork = ({ client, state }: Options) =>
  client.selectNetwork(state || client.getState());

export const getStatus = ({ client, state }: Options) =>
  client.selectStatuses(state || client.getState());

export const getAppDetails = ({ client, state }: Options) =>
  client.selectAppDetails(state || client.getState());

/** ------------------------------------------------------------------------------------------------------------------
 *   subscribers
 *  ------------------------------------------------------------------------------------------------------------------
 */

export const watchAccounts = (
  callback: (payload: State['accounts']) => void,
  client: MicroStacksClient = getClient()
) => client.subscribe(client.selectAccounts, callback, { equalityFn });

export const watchCurrentAccount = (
  callback: (payload?: Account) => void,
  client: MicroStacksClient = getClient()
) => client.subscribe(client.selectAccount, callback, { equalityFn });

export const watchStxAddress = (
  callback: (payload?: string) => void,
  client: MicroStacksClient = getClient()
) => client.subscribe(client.selectStxAddress, callback, { equalityFn });

export const watchIdentityAddress = (
  callback: (payload?: string) => void,
  client: MicroStacksClient = getClient()
) => client.subscribe(client.selectIdentityAddress, callback, { equalityFn });

export const watchDecentralizedID = (
  callback: (payload?: string) => void,
  client: MicroStacksClient = getClient()
) => client.subscribe(client.selectDecentralizedID, callback, { equalityFn });

export const watchNetwork = (
  callback: (payload: State['network']) => void,
  client: MicroStacksClient = getClient()
) => client.subscribe(client.selectNetwork, callback, { equalityFn });

export const watchStatus = (
  callback: (payload: State['statuses']) => void,
  client: MicroStacksClient = getClient()
) => client.subscribe(client.selectStatuses, callback, { equalityFn });

export const watchAppDetails = (
  callback: (payload?: { name?: string; icon?: string }) => void,
  client: MicroStacksClient = getClient()
) => client.subscribe(client.selectAppDetails, callback, { equalityFn });
