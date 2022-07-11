import * as React from 'react';
import { createClient, defaultStorage, getClient, MicroStacksClient } from '@micro-stacks/client';
import { MicroStacksClientContext } from '../common/context';
import {
  useOnAuthenticationEffect,
  useOnPersistEffect,
  useOnSignOutEffect,
} from '../hooks/use-client-callbacks';

import type { ClientConfig } from '@micro-stacks/client';
import type { PropsWithChildren } from 'react';

/** ------------------------------------------------------------------------------------------------------------------
 *   CallbacksProvider (private)
 *  ------------------------------------------------------------------------------------------------------------------
 */

const CallbacksProvider: React.FC<
  Pick<ClientConfig, 'onAuthentication' | 'onSignOut' | 'onPersistState'>
> = React.memo(({ onPersistState, onAuthentication, onSignOut }) => {
  useOnAuthenticationEffect(onAuthentication);
  useOnSignOutEffect(onSignOut);
  useOnPersistEffect(onPersistState);
  return null;
});

/** ------------------------------------------------------------------------------------------------------------------
 *   useEnsureSessionConsistency
 *
 *   This hook will try to retry persistence in the case that there is no dehydrated state but an active session
 *  ------------------------------------------------------------------------------------------------------------------
 */
function useEnsureSessionConsistency(config: ClientConfig, client: MicroStacksClient) {
  const mountRef = React.useRef(false);

  React.useEffect(() => {
    if (config?.onPersistState && !mountRef.current) {
      mountRef.current = true;
      if (!config.dehydratedState && client.hasSession) void client.persist();
    }
  }, [client, config?.onPersistState, config?.dehydratedState]);
}

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
    client: clientProp,
    dehydratedState,
    appIconUrl,
    appName,
    network,
    storage = defaultStorage,
    onPersistState,
    onAuthentication,
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
        onSignOut,
      ]
    );

    const client = React.useMemo(
      () =>
        createClient({
          config,
          client: clientProp,
        }),
      [config, clientProp]
    );

    useEnsureSessionConsistency(config, client);

    if (!clientProp) {
      const callbacksProvider = React.createElement(CallbacksProvider, {
        onPersistState,
        onAuthentication,
        onSignOut,
      });
      return React.createElement(
        MicroStacksClientContext.Provider,
        {
          value: client,
        },
        React.createElement(React.Fragment, null, [callbacksProvider, children])
      );
    }

    return React.createElement(
      MicroStacksClientContext.Provider,
      {
        value: client,
      },
      children
    );
  }
);
