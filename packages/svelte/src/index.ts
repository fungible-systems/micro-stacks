import * as Client from '@micro-stacks/client';
import { getContext, setContext } from 'svelte';
import { derived, readable } from 'svelte/store';
import { ChainID } from 'micro-stacks/common';
import { CLIENT_CONTEXT } from './common';

import type {
  MicroStacksClient,
  ContractCallParams,
  ContractDeployParams,
  StxTransferParams,
  State,
} from '@micro-stacks/client';
import type {
  FinishedTxData,
  SignatureData,
  SignedOptionsWithOnHandlers,
} from 'micro-stacks/connect';
import type { ClarityValue } from 'micro-stacks/clarity';
import type { StacksNetwork } from 'micro-stacks/network';

type Invalidator<T> = (value?: T) => void;
declare type Subscriber<T> = (value: T) => void;

interface Readable<T> {
  /**
   * Subscribe on value changes.
   * @param run subscription callback
   * @param invalidate cleanup callback
   */
  subscribe(this: void, run: Subscriber<T>, invalidate?: Invalidator<T>): () => void;
}

/** ------------------------------------------------------------------------------------------------------------------
 *   Client
 *  ------------------------------------------------------------------------------------------------------------------
 */

export { ClientProvider } from './client-provider';

export const mountClient = ({
  appName,
  appIconUrl,
  storage = Client.defaultStorage,
  network,
  dehydratedState,
  onPersistState,
  onSignOut,
  onAuthentication,
  fetcher,
}: Client.ClientConfig) => {
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

  setContext(
    CLIENT_CONTEXT,
    Client.createClient({
      config,
    })
  );
};

const ERROR_MESSAGE =
  'No MicroStacksClient set, mount the client in your app by wrapping your app in `ClientProvider` or using `mountClient`';

export const getMicroStacksClient = () => {
  const client = getContext<MicroStacksClient | undefined>(CLIENT_CONTEXT);
  if (!client) {
    throw new Error(ERROR_MESSAGE);
  }
  return client;
};

/** ------------------------------------------------------------------------------------------------------------------
 *   factory (helper function)
 *  ------------------------------------------------------------------------------------------------------------------
 */

type SubscriptionFn<V> = (setter: (value: V) => void, client: MicroStacksClient) => () => void;
type GetterFn<V> = (options: { client: MicroStacksClient; state?: State }) => V;

export function readableClientState<V>(getter: GetterFn<V>, subscribe: SubscriptionFn<V>) {
  return () => {
    const client = getMicroStacksClient();
    return readable(getter({ client }), set => {
      return subscribe(set, client);
    });
  };
}

/** ------------------------------------------------------------------------------------------------------------------
 *  Subscribed values (reactive)
 *  ------------------------------------------------------------------------------------------------------------------
 */

export const watchStxAddressState = readableClientState(
  Client.getStxAddress,
  Client.watchStxAddress
);
export const watchAccountsState = readableClientState(Client.getAccounts, Client.watchAccounts);
export const watchCurrentAccountState = readableClientState(
  Client.getCurrentAccount,
  Client.watchCurrentAccount
);
export const watchIdentityAddressState = readableClientState(
  Client.getIdentityAddress,
  Client.watchIdentityAddress
);
export const watchNetworkState = readableClientState(Client.getNetwork, Client.watchNetwork);
export const watchStatusState = readableClientState(Client.getStatus, Client.watchStatus);
export const watchDecentralizedIDState = readableClientState(
  Client.getDecentralizedID,
  Client.watchDecentralizedID
);

/** ------------------------------------------------------------------------------------------------------------------
 *  Account (derived state)
 *  ------------------------------------------------------------------------------------------------------------------
 */

export function getAccount() {
  return derived(
    [
      watchCurrentAccountState(),
      watchStxAddressState(),
      watchIdentityAddressState(),
      watchDecentralizedIDState(),
    ],
    ([$account, $stxAddress, $identityAddress, $decentralizedID]) => {
      return {
        appPrivateKey: $account?.appPrivateKey ?? null,
        rawAddress: $account?.address ?? null,
        stxAddress: $stxAddress,
        identityAddress: $identityAddress,
        decentralizedID: $decentralizedID,
        profileUrl: $account?.profile_url ?? null,
      };
    }
  );
}

/** ------------------------------------------------------------------------------------------------------------------
 *  Authentication (derived state)
 *  ------------------------------------------------------------------------------------------------------------------
 */

export function getAuth() {
  const client = getMicroStacksClient();

  return derived([getAccount(), watchStatusState()], ([$account, $status]) => {
    return {
      /**
       * actions
       */
      openAuthRequest: client.authenticate,
      signOut: client.signOut,
      /**
       * state
       */
      isSignedIn: !!$account.stxAddress,
      isRequestPending: $status[Client.StatusKeys.Authentication] === Client.Status.IsLoading,
    };
  });
}

/** ------------------------------------------------------------------------------------------------------------------
 *  Network (derived state)
 *  ------------------------------------------------------------------------------------------------------------------
 */

interface GetNetwork {
  network: StacksNetwork;
  isMainnet: boolean;
  setNetwork: (network: 'mainnet' | 'testnet' | StacksNetwork) => void;
}

export function geNetwork() {
  const client = getMicroStacksClient();

  const modifyNetwork = (network: StacksNetwork): GetNetwork => {
    network.isMainnet = () => network.chainId === ChainID.Mainnet;

    return {
      /**
       * actions
       */
      setNetwork: client.setNetwork,
      /**
       * state
       */
      network,
      isMainnet: network.isMainnet(),
    };
  };

  return derived([watchNetworkState()], ([$network]: [StacksNetwork]) => {
    return modifyNetwork($network!);
  });
}

/** ------------------------------------------------------------------------------------------------------------------
 *  Contract call (derived state)
 *  ------------------------------------------------------------------------------------------------------------------
 */

interface OpenContractCall {
  openContractCall: (params: ContractCallParams) => Promise<FinishedTxData | undefined>;
  isRequestPending: boolean;
}

export interface OptionalParams {
  onFinish?: (payload: FinishedTxData) => void;
  onCancel?: (error?: string) => void;
}

export function getOpenContractCall(callbacks?: OptionalParams): Readable<OpenContractCall> {
  const client = getMicroStacksClient();

  return derived([watchStatusState()], ([$status]) => {
    const openContractCall = (params: ContractCallParams) =>
      client.signTransaction(Client.TxType.ContractCall, {
        ...params,
        onFinish: (payload: FinishedTxData) => {
          params?.onFinish?.(payload);
          callbacks?.onFinish?.(payload);
        },
        onCancel: (error: string | undefined) => {
          params?.onCancel?.(error);
          callbacks?.onCancel?.(error);
        },
      });
    const isRequestPending =
      $status[Client.StatusKeys.TransactionSigning] === Client.Status.IsLoading;

    return {
      openContractCall,
      isRequestPending,
    };
  });
}

/** ------------------------------------------------------------------------------------------------------------------
 *  STX token transfer (derived state)
 *  ------------------------------------------------------------------------------------------------------------------
 */

export function getOpenStxTokenTransfer(callbacks?: OptionalParams) {
  const client = getMicroStacksClient();

  return derived([watchStatusState()], ([$status]) => {
    const openStxTokenTransfer = (params: StxTransferParams) =>
      client.signTransaction(Client.TxType.TokenTransfer, {
        ...params,
        onFinish: (payload: FinishedTxData) => {
          params?.onFinish?.(payload);
          callbacks?.onFinish?.(payload);
        },
        onCancel: (error: string | undefined) => {
          params?.onCancel?.(error);
          callbacks?.onCancel?.(error);
        },
      });
    const isRequestPending =
      $status[Client.StatusKeys.TransactionSigning] === Client.Status.IsLoading;

    return {
      openStxTokenTransfer,
      isRequestPending,
    };
  });
}

/** ------------------------------------------------------------------------------------------------------------------
 *   Contract deploy
 *  ------------------------------------------------------------------------------------------------------------------
 */

interface OpenContractDeploy {
  openContractDeploy: (params: ContractDeployParams) => Promise<FinishedTxData | undefined>;
  isRequestPending: boolean;
}

export function getOpenContractDeploy(callbacks?: OptionalParams): Readable<OpenContractDeploy> {
  const client = getMicroStacksClient();

  return derived([watchStatusState()], ([$status]) => {
    const openContractDeploy = (params: ContractDeployParams) =>
      client.signTransaction(Client.TxType.ContractDeploy, {
        ...params,
        onFinish: (payload: FinishedTxData) => {
          params?.onFinish?.(payload);
          callbacks?.onFinish?.(payload);
        },
        onCancel: (error: string | undefined) => {
          params?.onCancel?.(error);
          callbacks?.onCancel?.(error);
        },
      });
    const isRequestPending =
      $status[Client.StatusKeys.TransactionSigning] === Client.Status.IsLoading;

    return {
      openContractDeploy,
      isRequestPending,
    };
  });
}

/** ------------------------------------------------------------------------------------------------------------------
 *  Sign message (derived state)
 *  ------------------------------------------------------------------------------------------------------------------
 */

interface OpenSignMessage {
  openSignMessage: (
    params: SignedOptionsWithOnHandlers<{ message: string }>
  ) => Promise<SignatureData | undefined>;
  isRequestPending: boolean;
}

type OpenSignMessageParams = SignedOptionsWithOnHandlers<{ message: string }>;

export function getOpenSignMessage(
  callbacks?: SignedOptionsWithOnHandlers<{}>
): Readable<OpenSignMessage> {
  const client = getMicroStacksClient();

  return derived([watchStatusState()], ([$status]) => {
    const openSignMessage = async (params: OpenSignMessageParams) =>
      await client.signMessage({
        message: params.message,
        onFinish: (payload: SignatureData) => {
          params?.onFinish?.(payload);
          callbacks?.onFinish?.(payload);
        },
        onCancel: (payload: string | undefined) => {
          params?.onCancel?.(payload);
          callbacks?.onCancel?.(payload);
        },
      });
    const isRequestPending = $status[Client.StatusKeys.MessageSigning] === Client.Status.IsLoading;

    return {
      openSignMessage,
      isRequestPending,
    };
  });
}

/** ------------------------------------------------------------------------------------------------------------------
 *  Sign structured message (derived state)
 *  ------------------------------------------------------------------------------------------------------------------
 */

export type OpenSignStructuredMessageParams = SignedOptionsWithOnHandlers<{
  message: string | ClarityValue;
  domain?: {
    name?: string;
    version?: string;
    chainId?: ChainID;
  };
}>;

export interface OpenSignStructuredMessage {
  openSignStructuredMessage: (
    params: OpenSignStructuredMessageParams
  ) => Promise<SignatureData | undefined>;
  isRequestPending: boolean;
}

export function getOpenSignStructuredMessage(
  callbacks?: SignedOptionsWithOnHandlers<{}>
): Readable<OpenSignStructuredMessage> {
  const client = getMicroStacksClient();

  return derived([watchStatusState()], ([$status]) => {
    const openSignStructuredMessage = (params: OpenSignStructuredMessageParams) =>
      client.signStructuredMessage({
        message: params.message,
        domain: params.domain,
        onFinish: (payload: SignatureData) => {
          params?.onFinish?.(payload);
          callbacks?.onFinish?.(payload);
        },
        onCancel: (payload: string | undefined) => {
          params?.onCancel?.(payload);
          callbacks?.onCancel?.(payload);
        },
      });
    const isRequestPending =
      $status[Client.StatusKeys.StructuredMessageSigning] === Client.Status.IsLoading;

    return { openSignStructuredMessage, isRequestPending };
  });
}

/** ------------------------------------------------------------------------------------------------------------------
 *  Gaia
 *  ------------------------------------------------------------------------------------------------------------------
 */

export const getFile = (
  path: string,
  { decrypt = true, verify }: { decrypt?: boolean; verify?: boolean }
) => {
  const client = getMicroStacksClient();

  return client.getFile(path, { decrypt, verify });
};

export const putFile = (
  path: string,
  contents: string | Uint8Array | ArrayBufferView | Blob,
  { encrypt = true, sign }: { encrypt?: boolean; sign?: boolean }
) => {
  const client = getMicroStacksClient();

  return client.putFile(path, contents, { sign, encrypt });
};

/** ------------------------------------------------------------------------------------------------------------------
 */
