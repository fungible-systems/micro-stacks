import * as React from 'react';
import { ClientConfig, defaultStorage, getClient } from '@micro-stacks/client';
import { MicroStacksClientContext } from '../common/context';
import {
  useOnAuthenticationEffect,
  useOnPersistEffect,
  useOnSignOutEffect,
} from '../hooks/use-client-callbacks';
import { memo } from 'react';

/** ------------------------------------------------------------------------------------------------------------------
 *   CallbacksProvider (private)
 *  ------------------------------------------------------------------------------------------------------------------
 */

const CallbacksProvider: React.FC<
  Pick<ClientConfig, 'onAuthentication' | 'onSignOut' | 'onPersistState'>
> = memo(({ onPersistState, onAuthentication, onSignOut }) => {
  useOnAuthenticationEffect(onAuthentication);
  useOnSignOutEffect(onSignOut);
  useOnPersistEffect(onPersistState);
  return null;
});

/** ------------------------------------------------------------------------------------------------------------------
 *   ClientProvider
 *  ------------------------------------------------------------------------------------------------------------------
 */

export const ClientProvider: React.FC<
  {
    client?: ReturnType<typeof getClient>;
  } & ClientConfig
> = React.memo(
  ({
    children,
    client: client_,
    dehydratedState,
    appIconUrl,
    appName,
    network,
    storage = defaultStorage,
    onPersistState,
    onAuthentication,
    onSignOut,
  }) => {
    const client =
      client_ ??
      getClient({
        appName,
        appIconUrl,
        dehydratedState,
        network,
        storage,
        onPersistState,
        onAuthentication,
        onSignOut,
      });
    return (
      <MicroStacksClientContext.Provider value={client}>
        {!client_ ? (
          <CallbacksProvider
            onPersistState={onPersistState}
            onAuthentication={onAuthentication}
            onSignOut={onSignOut}
          />
        ) : null}
        {children}
      </MicroStacksClientContext.Provider>
    );
  }
);
