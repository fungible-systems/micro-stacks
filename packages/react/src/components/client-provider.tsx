import * as React from 'react';
import { createClient, defaultStorage, getClient } from '@micro-stacks/client';
import { MicroStacksClientContext } from '../common/context';
import {
  useOnAuthenticationEffect,
  useOnNoWalletFoundEffect,
  useOnPersistEffect,
  useOnSignOutEffect,
} from '../hooks/use-client-callbacks';

import type { MicroStacksClient, ClientConfig } from '@micro-stacks/client';
import type { PropsWithChildren } from 'react';

/** ------------------------------------------------------------------------------------------------------------------
 *   CallbacksProvider (private)
 *  ------------------------------------------------------------------------------------------------------------------
 */

const CallbacksProvider: React.FC<
  Pick<ClientConfig, 'onAuthentication' | 'onSignOut' | 'onPersistState' | 'onNoWalletFound'>
> = React.memo(({ onPersistState, onAuthentication, onSignOut, onNoWalletFound }) => {
  useOnAuthenticationEffect(onAuthentication);
  useOnSignOutEffect(onSignOut);
  useOnPersistEffect(onPersistState);
  useOnNoWalletFoundEffect(onNoWalletFound);
  return null;
});

/** ------------------------------------------------------------------------------------------------------------------
 *   useEnsureSessionConsistency
 *
 *   This hook will try to retry persistence in the case that there is no dehydrated state but an active session
 *  ------------------------------------------------------------------------------------------------------------------
 */
function useEnsureSessionConsistency(
  client: MicroStacksClient,
  config: ClientConfig,
  isEnabled: boolean
) {
  const mountRef = React.useRef(false);

  React.useEffect(() => {
    if (isEnabled) {
      if (config?.onPersistState && !mountRef.current) {
        mountRef.current = true;
        if (!config.dehydratedState && client.selectHasSession(client.getState()))
          void client.persist();
      }
    }
  }, [isEnabled, client, config?.onPersistState, config?.dehydratedState]);
}

/** ------------------------------------------------------------------------------------------------------------------
 *   useTabSyncEffect
 *
 *   This hook will sync data between tabs on events that change the persisted state
 *  ------------------------------------------------------------------------------------------------------------------
 */
function useTabSyncEffect(client: MicroStacksClient, isEnabled = false) {
  React.useEffect(() => {
    return client.tabSyncSubscription(isEnabled);
  }, [client, isEnabled]);
}

/** ------------------------------------------------------------------------------------------------------------------
 *   ClientProvider
 *  ------------------------------------------------------------------------------------------------------------------
 */

export const ClientProvider: React.FC<
  PropsWithChildren<
    {
      client?: ReturnType<typeof getClient>;
      enableSessionConsistencyEffect?: boolean;
      enableTabSync?: boolean;
    } & ClientConfig
  >
> = React.memo(
  ({
    children,
    client: clientProp,
    enableSessionConsistencyEffect = false,
    enableTabSync = false,
    dehydratedState,
    appIconUrl,
    appName,
    network,
    storage = defaultStorage,
    onPersistState,
    onAuthentication,
    onNoWalletFound,
    onSignOut,
  }) => {
    if (!!React.useContext(MicroStacksClientContext))
      throw Error(
        '[@micro-stacks/react] Nested ClientProviders detected, you should only have one instance of this component at the root of your app.'
      );

    const config = React.useMemo(
      () => ({
        appName,
        appIconUrl,
        dehydratedState,
        network,
        storage,
        onPersistState,
        onAuthentication,
        onNoWalletFound,
        onSignOut,
      }),
      [
        appName,
        appIconUrl,
        dehydratedState,
        network,
        storage,
        onPersistState,
        onAuthentication,
        onNoWalletFound,
        onSignOut,
      ]
    );

    const [client] = React.useState(() =>
      createClient({
        config,
        client: clientProp,
      })
    );

    useEnsureSessionConsistency(client, config, enableSessionConsistencyEffect);
    useTabSyncEffect(client, enableTabSync);

    return (
      <MicroStacksClientContext.Provider value={client}>
        <>
          {!clientProp ? (
            <CallbacksProvider
              onPersistState={onPersistState}
              onAuthentication={onAuthentication}
              onSignOut={onSignOut}
            />
          ) : null}
          {children}
        </>
      </MicroStacksClientContext.Provider>
    );
  }
);
