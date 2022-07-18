import type { Ref, UnwrapRef } from 'vue';
import { computed, inject, onMounted, onUnmounted, provide, reactive, ref, toRefs } from 'vue';

import type {
  ContractCallParams,
  ContractDeployParams,
  MicroStacksClient,
  State,
  StxTransferParams,
} from '@micro-stacks/client';
import * as Client from '@micro-stacks/client';

import { ChainID } from 'micro-stacks/common';

import type { SignedOptionsWithOnHandlers } from 'micro-stacks/connect';
import type { ClarityValue } from 'micro-stacks/clarity';

const CONTEXT_KEY = 'micro-stacks-client';

export function provideClient({
  appName,
  appIconUrl,
  storage = Client.defaultStorage,
  network,
  dehydratedState,
  onPersistState,
  onSignOut,
  onAuthentication,
  onNoWalletFound,
  fetcher,
}: Client.ClientConfig) {
  return provide(
    CONTEXT_KEY,
    ref<Client.MicroStacksClient>(
      Client.createClient({
        config: {
          appName,
          appIconUrl,
          storage,
          network,
          dehydratedState,
          onPersistState,
          onSignOut,
          onAuthentication,
          onNoWalletFound,
          fetcher,
        },
      })
    )
  );
}

export function injectClient() {
  const client = inject<Ref<Client.MicroStacksClient> | undefined>(CONTEXT_KEY);
  if (!client)
    throw new Error('No MicroStacksClient set, mount the client in your app using provideClient');
  return client;
}

/** ------------------------------------------------------------------------------------------------------------------
 *   factory (helper function)
 *  ------------------------------------------------------------------------------------------------------------------
 */

type GetterFn<V> = (options: { client: MicroStacksClient; state?: State }) => V;

export function reactiveClientStateFactory<V>(getter: GetterFn<V>) {
  return (): Ref<UnwrapRef<V>> => {
    const client = injectClient();
    const store = reactive({ state: ref(getter({ client: client.value })) });

    const unsub = ref(null as null | (() => void));

    onMounted(() => {
      unsub.value = client.value.subscribe(
        state => getter({ client: client.value, state }),
        v => {
          (store.state as any) = v;
        },
        { equalityFn: (a, b) => a === b }
      );
    });

    onUnmounted(() => {
      unsub.value?.();
    });
    return toRefs(store).state;
  };
}

/** ------------------------------------------------------------------------------------------------------------------
 *  Subscribed values (reactive)
 *  ------------------------------------------------------------------------------------------------------------------
 */

export const useWatchStxAddress = reactiveClientStateFactory(Client.getStxAddress);
export const useWatchAccounts = reactiveClientStateFactory(Client.getAccounts);
export const useWatchAccount = reactiveClientStateFactory(Client.getCurrentAccount);
export const useWatchIdentityAddress = reactiveClientStateFactory(Client.getIdentityAddress);
export const useWatchNetwork = reactiveClientStateFactory(Client.getNetwork);
export const useWatchStatuses = reactiveClientStateFactory(Client.getStatus);
export const useWatchDecentralizedID = reactiveClientStateFactory(Client.getDecentralizedID);

/** ------------------------------------------------------------------------------------------------------------------
 *  Account (derived state)
 *  ------------------------------------------------------------------------------------------------------------------
 */

export function useAccount() {
  const account = useWatchAccount();
  const stxAddress = useWatchStxAddress();
  const identityAddress = useWatchIdentityAddress();
  const decentralizedID = useWatchDecentralizedID();

  return {
    appPrivateKey: computed(() => account?.value?.appPrivateKey),
    rawAddress: computed(() => account?.value?.address),
    stxAddress: computed(() => stxAddress.value),
    identityAddress: computed(() => identityAddress.value),
    decentralizedID: computed(() => decentralizedID.value),
    profileUrl: computed(() => account?.value?.profile_url),
  };
}

/** ------------------------------------------------------------------------------------------------------------------
 *  Authentication (derived state)
 *  ------------------------------------------------------------------------------------------------------------------
 */

export function useAuth() {
  const client = injectClient();
  const status = useWatchStatuses();
  const account = useAccount();

  return {
    /**
     * actions
     */
    openAuthRequest: computed(() => client.value.authenticate),
    signOut: computed(() => client.value.signOut),
    /**
     * state
     */
    isSignedIn: computed(() => !!account.stxAddress.value),
    isRequestPending: computed(
      () => status.value[Client.StatusKeys.Authentication] === Client.Status.IsLoading
    ),
  };
}

/** ------------------------------------------------------------------------------------------------------------------
 *  Network (derived state)
 *  ------------------------------------------------------------------------------------------------------------------
 */

export const useNetwork = () => {
  const client = injectClient();
  const network = useWatchNetwork();

  return {
    /**
     * actions
     */
    setNetwork: computed(() => client?.value.setNetwork),
    /**
     * state
     */
    network,
    isMainnet: computed(() => network.value.chainId === ChainID.Mainnet),
  };
};

/** ------------------------------------------------------------------------------------------------------------------
 *  Contract call (derived state)
 *  ------------------------------------------------------------------------------------------------------------------
 */

export const useOpenContractCall = () => {
  const client = injectClient();
  const status = useWatchStatuses();

  return {
    openContractCall: computed(
      () => (params: ContractCallParams) =>
        client.value.signTransaction(Client.TxType.ContractCall, {
          ...params,
          onFinish: payload => {
            params?.onFinish?.(payload);
          },
          onCancel: error => {
            params?.onCancel?.(error);
          },
        })
    ),
    isRequestPending: computed(
      () => status.value[Client.StatusKeys.TransactionSigning] === Client.Status.IsLoading
    ),
  };
};

/** ------------------------------------------------------------------------------------------------------------------
 *  Contract deploy (derived state)
 *  ------------------------------------------------------------------------------------------------------------------
 */
export const useOpenContractDeploy = () => {
  const client = injectClient();
  const status = useWatchStatuses();

  return {
    openContractDeploy: computed(
      () => (params: ContractDeployParams) =>
        client.value.signTransaction(Client.TxType.ContractDeploy, {
          ...params,
          onFinish: payload => {
            params?.onFinish?.(payload);
          },
          onCancel: error => {
            params?.onCancel?.(error);
          },
        })
    ),
    isRequestPending: computed(
      () => status.value[Client.StatusKeys.TransactionSigning] === Client.Status.IsLoading
    ),
  };
};

/** ------------------------------------------------------------------------------------------------------------------
 *  Stx token transfer (derived state)
 *  ------------------------------------------------------------------------------------------------------------------
 */

export const useOpenStxTokenTransfer = () => {
  const client = injectClient();
  const status = useWatchStatuses();

  return {
    openStxTokenTransfer: computed(
      () => (params: StxTransferParams) =>
        client.value.signTransaction(Client.TxType.TokenTransfer, {
          ...params,
          onFinish: payload => {
            params?.onFinish?.(payload);
          },
          onCancel: error => {
            params?.onCancel?.(error);
          },
        })
    ),
    isRequestPending: computed(
      () => status.value[Client.StatusKeys.TransactionSigning] === Client.Status.IsLoading
    ),
  };
};

/** ------------------------------------------------------------------------------------------------------------------
 *  Sign message (derived state)
 *  ------------------------------------------------------------------------------------------------------------------
 */

export const useOpenSignMessage = () => {
  const client = injectClient();
  const status = useWatchStatuses();

  return {
    openSignMessage: computed(
      () => (params: SignedOptionsWithOnHandlers<{ message: string }>) =>
        client.value.signMessage({
          ...params,
          onFinish: payload => {
            params?.onFinish?.(payload);
          },
          onCancel: error => {
            params?.onCancel?.(error);
          },
        })
    ),
    isRequestPending: computed(
      () => status.value[Client.StatusKeys.MessageSigning] === Client.Status.IsLoading
    ),
  };
};
/** ------------------------------------------------------------------------------------------------------------------
 *  Sign structured message (derived state)
 *  ------------------------------------------------------------------------------------------------------------------
 */

export const useOpenSignStructuredMessage = () => {
  const client = injectClient();
  const status = useWatchStatuses();

  return () => ({
    openSignStructuredMessage: computed(
      () =>
        (
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
          })
    ),
    isRequestPending: computed(
      () => status.value[Client.StatusKeys.StructuredMessageSigning] === Client.Status.IsLoading
    ),
  });
};
