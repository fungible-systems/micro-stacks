import type { ClientConfig } from '@micro-stacks/client';
import { useMicroStacksClient } from './use-client';
import { useEffect } from 'react';
import { useEvent } from '../common/use-event';

type ConfigCallback<K extends keyof ClientConfig> = ClientConfig[K];

/** ------------------------------------------------------------------------------------------------------------------
 *   Setter callbacks
 *  ------------------------------------------------------------------------------------------------------------------
 */

export const useSetOnNoWalletFoundState = () => {
  return useMicroStacksClient().setOnNoWalletFound;
};

export const useSetOnPersistState = () => {
  return useMicroStacksClient().setOnPersistState;
};

export const useSetOnAuthentication = (): ((
  onAuthentication: ClientConfig['onAuthentication']
) => void) => {
  return useMicroStacksClient().setOnAuthentication;
};

export const useSetOnSignOut = () => {
  return useMicroStacksClient().setOnSignOut;
};

/** ------------------------------------------------------------------------------------------------------------------
 *   Setter effects
 *  ------------------------------------------------------------------------------------------------------------------
 */

export const useOnAuthenticationEffect = (callback: ConfigCallback<'onAuthentication'>) => {
  const setter = useSetOnAuthentication();
  const wrapped = useEvent(callback);
  useEffect(() => {
    if (callback) setter(wrapped);
  }, [callback, setter, wrapped]);
};

export const useOnSignOutEffect = (callback: ConfigCallback<'onSignOut'>) => {
  const setter = useSetOnSignOut();
  const wrapped = useEvent(callback);
  useEffect(() => {
    if (callback) setter(wrapped);
  }, [callback, setter, wrapped]);
};

export const useOnPersistEffect = (callback: ConfigCallback<'onPersistState'>) => {
  const setter = useSetOnPersistState();
  const wrapped = useEvent(callback);
  useEffect(() => {
    if (callback) setter(wrapped);
  }, [callback, setter, wrapped]);
};

export const useOnNoWalletFoundEffect = (callback: ConfigCallback<'onPersistState'>) => {
  const setter = useSetOnNoWalletFoundState();
  const wrapped = useEvent(callback);
  useEffect(() => {
    if (callback) setter(wrapped);
  }, [callback, setter, wrapped]);
};
