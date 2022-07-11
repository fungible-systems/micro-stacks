import { ref, provide, inject, Ref, reactive, toRefs, computed, UnwrapRef } from 'vue';

import * as Client from '@micro-stacks/client';

import { ChainID } from 'micro-stacks/common';

import type {
  MicroStacksClient,
  ContractCallParams,
  ContractDeployParams,
  StxTransferParams,
} from '@micro-stacks/client';

import type { SignedOptionsWithOnHandlers } from 'micro-stacks/connect';
import type { ClarityValue } from 'micro-stacks/clarity';

export function provideClient({
  appName,
  appIconUrl,
  storage = Client.defaultStorage,
  network,
  dehydratedState,
  onPersistState,
  onSignOut,
  onAuthentication,
  fetcher,
}: Client.ClientConfig) {
  const config = {
    appName,
    appIconUrl,
    storage,
    network,
    dehydratedState,
    onPersistState,
    onSignOut,
    onAuthentication,
    fetcher,
  };

  const client = ref<Client.MicroStacksClient>(
    Client.createClient({
      config,
    })
  );

  return provide('micro-stacks-client', client);
}

export function injectClient() {
  const client = inject<Ref<Client.MicroStacksClient> | undefined>('micro-stacks-client');
  if (!client) {
    throw new Error('No MicroStacksClient set, mount the client in your app using provideClient');
  }
  return client;
}

/** ------------------------------------------------------------------------------------------------------------------
 *   factory (helper function)
 *  ------------------------------------------------------------------------------------------------------------------
 */

type SubscriptionFn<V> = (setter: (value: V) => void, client: MicroStacksClient) => () => void;
type GetterFn<V> = (client: MicroStacksClient) => V;

export function reactiveClientStateFactory<V>(getter: GetterFn<V>, subscribe: SubscriptionFn<V>) {
  return (): Ref<UnwrapRef<V>> => {
    const client = injectClient();
    const store = reactive({ state: ref(getter(client.value)) });

    subscribe(v => {
      (store.state as any) = v;
    }, client.value);

    return toRefs(store).state;
  };
}

/** ------------------------------------------------------------------------------------------------------------------
 *  Subscribed values (reactive)
 *  ------------------------------------------------------------------------------------------------------------------
 */

export const useWatchStxAddress = reactiveClientStateFactory(
  Client.getStxAddress,
  Client.watchStxAddress
);
export const useWatchAccounts = reactiveClientStateFactory(
  Client.getAccounts,
  Client.watchAccounts
);
export const useWatchAccount = reactiveClientStateFactory(
  Client.getCurrentAccount,
  Client.watchCurrentAccount
);
export const useWatchIdentityAddress = reactiveClientStateFactory(
  Client.getIdentityAddress,
  Client.watchIdentityAddress
);
export const useWatchNetwork = reactiveClientStateFactory(Client.getNetwork, Client.watchNetwork);
export const useWatchStatuses = reactiveClientStateFactory(Client.getStatus, Client.watchStatus);
export const useWatchDecentralizedID = reactiveClientStateFactory(
  Client.getDecentralizedID,
  Client.watchDecentralizedID
);

/** ------------------------------------------------------------------------------------------------------------------
 *  Account (derived state)
 *  ------------------------------------------------------------------------------------------------------------------
 */

export function useAccount() {
  const account = useWatchAccount();
  const stxAddress = useWatchStxAddress();
  const identityAddress = useWatchIdentityAddress();
  const decentralizedID = useWatchDecentralizedID();

  return computed(() => ({
    appPrivateKey: account?.value.appPrivateKey,
    rawAddress: account?.value.address,
    stxAddress: stxAddress.value,
    identityAddress: identityAddress.value,
    decentralizedID: decentralizedID.value,
    profileUrl: account?.value.profile_url,
  }));
}

/** ------------------------------------------------------------------------------------------------------------------
 *  Authentication (derived state)
 *  ------------------------------------------------------------------------------------------------------------------
 */

export function useAuth() {
  const client = injectClient();
  const status = useWatchStatuses();
  const account = useAccount();

  return computed(() => {
    return {
      /**
       * actions
       */
      openAuthRequest: client.value.authenticate,
      signOut: client.value.signOut,
      /**
       * state
       */
      isSignedIn: !!account.value.stxAddress,
      isRequestPending: status.value[Client.StatusKeys.Authentication] === Client.Status.IsLoading,
    };
  });
}

/** ------------------------------------------------------------------------------------------------------------------
 *  Network (derived state)
 *  ------------------------------------------------------------------------------------------------------------------
 */

export const useNetwork = () => {
  const client = injectClient();
  const network = useWatchNetwork();

  const isMainnet = network.value.chainId === ChainID.Mainnet;
  return {
    /**
     * actions
     */
    setNetwork: client?.value.setNetwork,
    /**
     * state
     */
    network,
    isMainnet,
  };
};

/** ------------------------------------------------------------------------------------------------------------------
 *  Contract call (derived state)
 *  ------------------------------------------------------------------------------------------------------------------
 */

export const useOpenContractCallState = () => {
  const client = injectClient();
  const status = useWatchStatuses();

  const openContractCall = (params: ContractCallParams) =>
      client.value.signTransaction(Client.TxType.ContractCall, {
        ...params,
        onFinish: payload => {
          params?.onFinish?.(payload);
        },
        onCancel: error => {
          params?.onCancel?.(error);
        },
      }),
    isRequestPending =
      status.value[Client.StatusKeys.TransactionSigning] === Client.Status.IsLoading;

  return {
    openContractCall,
    isRequestPending,
  };
};

/** ------------------------------------------------------------------------------------------------------------------
 *  Contract deploy (derived state)
 *  ------------------------------------------------------------------------------------------------------------------
 */
export const useopenContractDeployState = () => {
  const client = injectClient();
  const status = useWatchStatuses();

  const openContractDeploy = (params: ContractDeployParams) =>
      client.value.signTransaction(Client.TxType.ContractDeploy, {
        ...params,
        onFinish: payload => {
          params?.onFinish?.(payload);
        },
        onCancel: error => {
          params?.onCancel?.(error);
        },
      }),
    isRequestPending =
      status.value[Client.StatusKeys.TransactionSigning] === Client.Status.IsLoading;

  return {
    openContractDeploy,
    isRequestPending,
  };
};

/** ------------------------------------------------------------------------------------------------------------------
 *  Stx token transfer (derived state)
 *  ------------------------------------------------------------------------------------------------------------------
 */

export const useOpenStxTokenTransferState = () => {
  const client = injectClient();
  const status = useWatchStatuses();

  const openStxTokenTransfer = (params: StxTransferParams) =>
      client.value.signTransaction(Client.TxType.TokenTransfer, {
        ...params,
        onFinish: payload => {
          params?.onFinish?.(payload);
        },
        onCancel: error => {
          params?.onCancel?.(error);
        },
      }),
    isRequestPending =
      status.value[Client.StatusKeys.TransactionSigning] === Client.Status.IsLoading;

  return {
    openStxTokenTransfer,
    isRequestPending,
  };
};

/** ------------------------------------------------------------------------------------------------------------------
 *  Sign message (derived state)
 *  ------------------------------------------------------------------------------------------------------------------
 */

export const useOpenSignMessageState = () => {
  const client = injectClient();
  const status = useWatchStatuses();

  const openSignMessage = (params: SignedOptionsWithOnHandlers<{ message: string }>) =>
      client.value.signMessage({
        ...params,
        onFinish: payload => {
          params?.onFinish?.(payload);
        },
        onCancel: error => {
          params?.onCancel?.(error);
        },
      }),
    isRequestPending = status.value[Client.StatusKeys.MessageSigning] === Client.Status.IsLoading;

  return {
    openSignMessage,
    isRequestPending,
  };
};
/** ------------------------------------------------------------------------------------------------------------------
 *  Sign structured message (derived state)
 *  ------------------------------------------------------------------------------------------------------------------
 */

export const useOpenSignStructuredMessageState = () => {
  const client = injectClient();
  const status = useWatchStatuses();

  const openSignStructuredMessage = (
      params: SignedOptionsWithOnHandlers<{
        message: string | ClarityValue;
        domain?: {
          name?: string;
          version?: string;
          chainId?: ChainID;
        };
      }>
    ) =>
      client.value.signStructuredMessage({
        ...params,
        onFinish: payload => {
          params?.onFinish?.(payload);
        },
        onCancel: error => {
          params?.onCancel?.(error);
        },
      }),
    isRequestPending =
      status.value[Client.StatusKeys.StructuredMessageSigning] === Client.Status.IsLoading;

  return {
    openSignStructuredMessage,
    isRequestPending,
  };
};
