import type { ClientConfig, MicroStacksClient } from '@micro-stacks/client';
import { useMicroStacksClient } from './context';

type ConfigCallback<K extends keyof ClientConfig> = ClientConfig[K];

export function getSetOnAuthentication(): MicroStacksClient['setOnAuthentication'] {
  const client = useMicroStacksClient();
  return client.setOnAuthentication;
}

export function getSetOnSignOut(): MicroStacksClient['setOnSignOut'] {
  const client = useMicroStacksClient();
  return client.setOnSignOut;
}

export function getSetOnPersistState(): MicroStacksClient['setOnPersistState'] {
  const client = useMicroStacksClient();
  return client.setOnPersistState;
}

export function onAuthentication(callback: ConfigCallback<'onAuthentication'>) {
  const setOnAuthentication = getSetOnAuthentication();

  setOnAuthentication(callback);
}

export function onSignOut(callback: ConfigCallback<'onSignOut'>) {
  const setOnSignOut = getSetOnSignOut();

  setOnSignOut(callback);
}

export function onPersistState(callback: ConfigCallback<'onPersistState'>) {
  const setOnPersistState = getSetOnPersistState();

  setOnPersistState(callback!); // TODO: Type should be fixed (!)
}
