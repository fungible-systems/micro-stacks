import * as React from 'react';
import { ClientConfig, defaultStorage, getClient } from '@micro-stacks/client';
import { MicroStacksClientContext } from '../common/context';
import {
  useOnAuthenticationEffect,
  useOnPersistEffect,
  useOnSignOutEffect,
} from '../hooks/use-client-callbacks';
import { memo, PropsWithChildren, useContext, useEffect, useRef } from 'react';
import { useCreateClient } from '../hooks/use-create-client';

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
  PropsWithChildren<
    {
      client?: ReturnType<typeof getClient>;
    } & ClientConfig
  >
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
    if (!!useContext(MicroStacksClientContext))
      throw Error(
        '[@micro-stacks/react] Nested ClientProviders detected, you should only have one instance of this component at the root of your app.'
      );

    const mountRef = useRef(false);

    const client = useCreateClient({
      config: {
        appName,
        appIconUrl,
        dehydratedState,
        network,
        storage,
        onPersistState,
        onAuthentication,
        onSignOut,
      },
      dehydratedState,
    });

    useEffect(() => {
      if (onPersistState && !mountRef.current) {
        mountRef.current = true;
        if (!dehydratedState && client.hasSession) void client.persist();
      }
    }, [client, dehydratedState, onPersistState]);

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
