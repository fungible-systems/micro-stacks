import type { Accessor } from 'solid-js';

import { createContext, createSignal, onCleanup, useContext, onMount } from 'solid-js';
import {
  getAccounts,
  getCurrentAccount,
  getStatus,
  getNetwork,
  getIdentityAddress,
  getDecentralizedID,
  getStxAddress,
  TxType,
  StatusKeys,
  Status,
  defaultStorage,
  createClient,
} from '@micro-stacks/client';
import { ChainID } from 'micro-stacks/common';

import type {
  MicroStacksClient,
  ContractCallParams,
  ContractDeployParams,
  StxTransferParams,
  ClientConfig,
  Account,
  State,
} from '@micro-stacks/client';
import type { SignedOptionsWithOnHandlers } from 'micro-stacks/connect';
import type { ClarityValue } from 'micro-stacks/clarity';
import type { StacksNetwork } from 'micro-stacks/network';

/** ------------------------------------------------------------------------------------------------------------------
 *   Client context
 *  ------------------------------------------------------------------------------------------------------------------
 */

export const ClientContext = createContext<Accessor<MicroStacksClient> | undefined>();

export function useCreateClient({
  client: clientProp,
  dehydratedState,
  appIconUrl,
  appName,
  network,
  storage = defaultStorage,
  onPersistState,
  onAuthentication,
  onNoWalletFound,
  onSignOut,
}: ClientConfig & { client?: MicroStacksClient }) {
  const config = {
    appName,
    appIconUrl,
    dehydratedState,
    network,
    storage,
    onPersistState,
    onAuthentication,
    onNoWalletFound,
    onSignOut,
  };

  return createSignal(createClient({ config, client: clientProp }))[0];
}

export const useMicroStacksClient = () => {
  const client = useContext(ClientContext);
  if (!client)
    throw new Error('No MicroStacksClient set, wrap your app in ClientContext.Provider to set one');
  return client;
};

/** ------------------------------------------------------------------------------------------------------------------
 *   store factory (helper function)
 *  ------------------------------------------------------------------------------------------------------------------
 */

type GetterFn<V> = (options: { client: MicroStacksClient; state?: State }) => V;

function stateHookFactory<V>(getter: GetterFn<V>): () => Accessor<V> {
  return () => {
    const client = useMicroStacksClient();
    const [state, setState] = createSignal<V>(getter({ client: client() }));

    let unsub: undefined | (() => void);

    onMount(() => {
      unsub = client().subscribe(state => getter({ client: client(), state }) as any, setState, {
        equalityFn: (a, b) => a === b,
      });
    });

    onCleanup(() => {
      unsub?.();
    });

    return state;
  };
}

/** ------------------------------------------------------------------------------------------------------------------
 *  Store values
 *  ------------------------------------------------------------------------------------------------------------------
 */

export const useWatchStxAddress = stateHookFactory(getStxAddress);
export const useWatchAccounts = stateHookFactory(getAccounts);
export const useWatchCurrentAccount = stateHookFactory(getCurrentAccount);
export const useWatchIdentityAddress = stateHookFactory(getIdentityAddress);
export const useWatchNetwork = stateHookFactory(getNetwork);
export const useWatchStatus = stateHookFactory(getStatus);
export const useWatchDecentralizedID = stateHookFactory(getDecentralizedID);

/** ------------------------------------------------------------------------------------------------------------------
 *  Authentication (derived state)
 *  ------------------------------------------------------------------------------------------------------------------
 */

export const useAuth = () => {
  const client = useMicroStacksClient();
  const stxAddress = useWatchStxAddress();
  const status = useWatchStatus();
  const isSignedIn: Accessor<boolean> = () => !!stxAddress();
  const isRequestPending: Accessor<boolean> = () =>
    status()[StatusKeys.Authentication] === Status.IsLoading;
  return {
    /**
     * actions
     */
    openAuthRequest: (params?: Parameters<ReturnType<typeof client>['authenticate']>[0]) => {
      const { authenticate } = client();
      return authenticate(params);
    },
    signOut: (params?: Parameters<ReturnType<typeof client>['signOut']>[0]) =>
      client().signOut(params),
    /**
     * state
     */
    isSignedIn,
    isRequestPending,
  };
};

/** ------------------------------------------------------------------------------------------------------------------
 *  Account (derived state)
 *  ------------------------------------------------------------------------------------------------------------------
 */

interface UseAccountState {
  appPrivateKey: Accessor<string | undefined>;
  rawAddress: Accessor<Account['address'] | undefined>;
  identityAddress: Accessor<string | undefined>;
  decentralizedID: Accessor<string | undefined>;
  stxAddress: Accessor<string | undefined>;
  profileUrl: Accessor<string | undefined>;
}

export const useAccount = (): UseAccountState => {
  const account = useWatchCurrentAccount();
  return {
    appPrivateKey: () => account()?.appPrivateKey,
    rawAddress: () => account()?.address,
    identityAddress: useWatchIdentityAddress(),
    decentralizedID: useWatchDecentralizedID(),
    stxAddress: useWatchStxAddress(),
    profileUrl: () => account()?.profile_url,
  };
};

/** ------------------------------------------------------------------------------------------------------------------
 *  Network (derived state)
 *  ------------------------------------------------------------------------------------------------------------------
 */

export const useNetwork = () => {
  const client = useMicroStacksClient();
  const network = useWatchNetwork();

  const isMainnet: Accessor<boolean> = (): boolean => network().chainId === ChainID.Mainnet;
  return {
    /**
     * actions
     */
    setNetwork: (network: 'mainnet' | 'testnet' | StacksNetwork) => client().setNetwork(network),
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

export const useOpenContractCall = () => {
  const client = useMicroStacksClient();
  const status = useWatchStatus();

  const openContractCall = (params: ContractCallParams) =>
      client().signTransaction(TxType.ContractCall, {
        ...params,
        onFinish: payload => {
          params?.onFinish?.(payload);
        },
        onCancel: error => {
          params?.onCancel?.(error);
        },
      }),
    isRequestPending: Accessor<boolean> = () =>
      status()[StatusKeys.TransactionSigning] === Status.IsLoading;

  return {
    openContractCall,
    isRequestPending,
  };
};

/** ------------------------------------------------------------------------------------------------------------------
 *  Contract deploy (derived state)
 *  ------------------------------------------------------------------------------------------------------------------
 */
export const useOpenContractDeploy = () => {
  const client = useMicroStacksClient();
  const status = useWatchStatus();

  const openContractDeploy = (params: ContractDeployParams) =>
      client().signTransaction(TxType.ContractDeploy, {
        ...params,
        onFinish: payload => {
          params?.onFinish?.(payload);
        },
        onCancel: error => {
          params?.onCancel?.(error);
        },
      }),
    isRequestPending: Accessor<boolean> = () =>
      status()[StatusKeys.TransactionSigning] === Status.IsLoading;

  return {
    openContractDeploy,
    isRequestPending,
  };
};

/** ------------------------------------------------------------------------------------------------------------------
 *  Stx token transfer (derived state)
 *  ------------------------------------------------------------------------------------------------------------------
 */

export const useOpenStxTokenTransfer = () => {
  const client = useMicroStacksClient();
  const status = useWatchStatus();

  const openStxTokenTransfer = (params: StxTransferParams) =>
      client().signTransaction(TxType.TokenTransfer, {
        ...params,
        onFinish: payload => {
          params?.onFinish?.(payload);
        },
        onCancel: error => {
          params?.onCancel?.(error);
        },
      }),
    isRequestPending: Accessor<boolean> = () =>
      status()[StatusKeys.TransactionSigning] === Status.IsLoading;

  return {
    openStxTokenTransfer,
    isRequestPending,
  };
};

/** ------------------------------------------------------------------------------------------------------------------
 *  Sign message (derived state)
 *  ------------------------------------------------------------------------------------------------------------------
 */

export const useOpenSignMessage = () => {
  const client = useMicroStacksClient();
  const status = useWatchStatus();

  const openSignMessage = (params: SignedOptionsWithOnHandlers<{ message: string }>) =>
      client().signMessage({
        ...params,
        onFinish: payload => {
          params?.onFinish?.(payload);
        },
        onCancel: error => {
          params?.onCancel?.(error);
        },
      }),
    isRequestPending: Accessor<Boolean> = () =>
      status()[StatusKeys.MessageSigning] === Status.IsLoading;

  return {
    openSignMessage,
    isRequestPending,
  };
};

/** ------------------------------------------------------------------------------------------------------------------
 *  Sign structured message (derived state)
 *  ------------------------------------------------------------------------------------------------------------------
 */

export const useOpenSignStructuredMessage = () => {
  const client = useMicroStacksClient();
  const status = useWatchStatus();

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
      client().signStructuredMessage({
        ...params,
        onFinish: payload => {
          params?.onFinish?.(payload);
        },
        onCancel: error => {
          params?.onCancel?.(error);
        },
      }),
    isRequestPending: Accessor<Boolean> = () =>
      status()[StatusKeys.StructuredMessageSigning] === Status.IsLoading;

  return {
    openSignStructuredMessage,
    isRequestPending,
  };
};

/** ------------------------------------------------------------------------------------------------------------------
 */
