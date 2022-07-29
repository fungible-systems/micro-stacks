import React, { createElement, useMemo } from 'react';
import { atom, Provider, useAtomValue } from 'jotai';
import { useMicroStacksClient } from '@micro-stacks/react';
import { createClientAdapter, GaiaConfig, Model, Storage } from '@micro-stacks/storage';
import {
  watchAccounts,
  watchCurrentAccount,
  watchStatus,
  watchNetwork,
  watchIdentityAddress,
  watchDecentralizedID,
  getAccounts,
  getCurrentAccount,
  getStatus,
  getNetwork,
  getIdentityAddress,
  getDecentralizedID,
  watchStxAddress,
  getStxAddress,
  TxType,
  StatusKeys,
  Status,
} from '@micro-stacks/client';
import { ChainID } from 'micro-stacks/common';

import type {
  State,
  MicroStacksClient,
  ContractCallParams,
  ContractDeployParams,
  StxTransferParams,
} from '@micro-stacks/client';
import type { PropsWithChildren } from 'react';
import type { SignedOptionsWithOnHandlers } from 'micro-stacks/connect';
import type { ClarityValue } from 'micro-stacks/clarity';

/** ------------------------------------------------------------------------------------------------------------------
 *   Client
 *  ------------------------------------------------------------------------------------------------------------------
 */

const NO_CLIENT_MESSAGE =
  'No client set in jotai context, wrap your app in JotaiClientProvider to set one';

const clientAtom = atom<MicroStacksClient | null>(null);
export const clientState = atom<MicroStacksClient>(get => {
  const client = get(clientAtom);
  if (!client) throw new Error(NO_CLIENT_MESSAGE);
  return client;
});

/** ------------------------------------------------------------------------------------------------------------------
 *   Jotai provider (for setting client context)
 *  ------------------------------------------------------------------------------------------------------------------
 */

// this goes below `ClientProvider` in your app
export const JotaiClientProvider: React.FC<PropsWithChildren<{}>> = ({ children }) => {
  const client = useMicroStacksClient();

  const props = useMemo(
    () => ({
      initialValues: [[clientAtom, client] as const],
    }),
    [client]
  );

  return createElement(Provider, props, children);
};

/** ------------------------------------------------------------------------------------------------------------------
 *   Atom factory (helper function)
 *  ------------------------------------------------------------------------------------------------------------------
 */

type SubscriptionFn<V> = (setter: (value: V) => void, client: MicroStacksClient) => () => void;
type GetterFn<V> = (options: { client: MicroStacksClient; state?: State }) => V;

function atomWithMicroStacks<V>(getter: GetterFn<V>, subscribe: SubscriptionFn<V>) {
  return atom<V>(get => {
    const client = get(clientState);
    const valueAtom = atom<V>(getter({ client }));
    const subscriberAtom = atom<V, V>(
      get => {
        return get(valueAtom);
      },
      (_get, set, action) => {
        set(valueAtom, action);
      }
    );
    subscriberAtom.onMount = setAtom => {
      const unsubscribe = subscribe(setAtom, client);
      return () => {
        unsubscribe();
      };
    };
    return get(subscriberAtom);
  });
}

/** ------------------------------------------------------------------------------------------------------------------
 *  Subscribed values
 *  ------------------------------------------------------------------------------------------------------------------
 */

export const stxAddressAtom = atomWithMicroStacks(getStxAddress, watchStxAddress);
export const accountsAtom = atomWithMicroStacks(getAccounts, watchAccounts);
export const currentAccountAtom = atomWithMicroStacks(getCurrentAccount, watchCurrentAccount);
export const identityAddressAtom = atomWithMicroStacks(getIdentityAddress, watchIdentityAddress);
export const networkAtom = atomWithMicroStacks(getNetwork, watchNetwork);
export const statusAtom = atomWithMicroStacks(getStatus, watchStatus);
export const decentralizedIDAtom = atomWithMicroStacks(getDecentralizedID, watchDecentralizedID);

export const useStxAddressValue = () => useAtomValue(stxAddressAtom);
export const useAccountsValue = () => useAtomValue(accountsAtom);
export const useCurrentAccountValue = () => useAtomValue(currentAccountAtom);
export const useIdentityAddressValue = () => useAtomValue(identityAddressAtom);
export const useNetworkValue = () => useAtomValue(networkAtom);
export const useStatusValue = () => useAtomValue(statusAtom);
export const useDecentralizedIDValue = () => useAtomValue(decentralizedIDAtom);

/** ------------------------------------------------------------------------------------------------------------------
 *  Authentication (derived state)
 *  ------------------------------------------------------------------------------------------------------------------
 */

export const authState = atom(get => {
  const client = useMicroStacksClient();
  const stxAddress = get(stxAddressAtom);
  const status = get(statusAtom);
  return {
    /**
     * actions
     */
    openAuthRequest: client.authenticate,
    signOut: client.signOut,
    /**
     * state
     */
    isSignedIn: !!stxAddress,
    isRequestPending: status[StatusKeys.Authentication] === Status.IsLoading,
  };
});

export const useAuthState = () => useAtomValue(authState);

/** ------------------------------------------------------------------------------------------------------------------
 *  Account (derived state)
 *  ------------------------------------------------------------------------------------------------------------------
 */

export const accountState = atom(get => {
  const account = get(currentAccountAtom);
  return {
    appPrivateKey: account?.appPrivateKey ?? null,
    rawAddress: account?.address ?? null,
    identityAddress: get(identityAddressAtom),
    decentralizedID: get(decentralizedIDAtom),
    stxAddress: get(stxAddressAtom),
    profileUrl: account?.profile_url ?? null,
  };
});

export const useAccountState = () => useAtomValue(accountState);

/** ------------------------------------------------------------------------------------------------------------------
 *  Network (derived state)
 *  ------------------------------------------------------------------------------------------------------------------
 */

export const networkState = atom(get => {
  const client = get(clientState);
  const network = get(networkAtom);

  network.isMainnet = () => network.chainId === ChainID.Mainnet;

  const isMainnet = network.isMainnet();
  return {
    /**
     * actions
     */
    setNetwork: client.setNetwork,
    /**
     * state
     */
    network,
    isMainnet,
  };
});

export const useNetworkState = () => useAtomValue(networkState);

/** ------------------------------------------------------------------------------------------------------------------
 *  Contract call (derived state)
 *  ------------------------------------------------------------------------------------------------------------------
 */

export const openContractCallState = atom(get => {
  const client = get(clientState);
  const status = get(statusAtom);

  const openContractCall = (params: ContractCallParams) =>
      client.signTransaction(TxType.ContractCall, {
        ...params,
        onFinish: payload => {
          params?.onFinish?.(payload);
        },
        onCancel: error => {
          params?.onCancel?.(error);
        },
      }),
    isRequestPending = status[StatusKeys.TransactionSigning] === Status.IsLoading;

  return {
    openContractCall,
    isRequestPending,
  };
});

export const useOpenContractCallState = () => useAtomValue(openContractCallState);

/** ------------------------------------------------------------------------------------------------------------------
 *  Contract deploy (derived state)
 *  ------------------------------------------------------------------------------------------------------------------
 */
export const openContractDeployState = atom(get => {
  const client = get(clientState);
  const status = get(statusAtom);

  const openContractDeploy = (params: ContractDeployParams) =>
      client.signTransaction(TxType.ContractDeploy, {
        ...params,
        onFinish: payload => {
          params?.onFinish?.(payload);
        },
        onCancel: error => {
          params?.onCancel?.(error);
        },
      }),
    isRequestPending = status[StatusKeys.TransactionSigning] === Status.IsLoading;

  return {
    openContractDeploy,
    isRequestPending,
  };
});

export const useOpenContractDeployState = () => useAtomValue(openContractDeployState);

/** ------------------------------------------------------------------------------------------------------------------
 *  Stx token transfer (derived state)
 *  ------------------------------------------------------------------------------------------------------------------
 */

export const openStxTokenTransferState = atom(get => {
  const client = get(clientState);
  const status = get(statusAtom);

  const openStxTokenTransfer = (params: StxTransferParams) =>
      client.signTransaction(TxType.TokenTransfer, {
        ...params,
        onFinish: payload => {
          params?.onFinish?.(payload);
        },
        onCancel: error => {
          params?.onCancel?.(error);
        },
      }),
    isRequestPending = status[StatusKeys.TransactionSigning] === Status.IsLoading;

  return {
    openStxTokenTransfer,
    isRequestPending,
  };
});

export const useOpenStxTokenTransferState = () => useAtomValue(openStxTokenTransferState);

/** ------------------------------------------------------------------------------------------------------------------
 *  Sign message (derived state)
 *  ------------------------------------------------------------------------------------------------------------------
 */

export const openSignMessageState = atom(get => {
  const client = get(clientState);
  const status = get(statusAtom);

  const openSignMessage = (params: SignedOptionsWithOnHandlers<{ message: string }>) =>
      client.signMessage({
        ...params,
        onFinish: payload => {
          params?.onFinish?.(payload);
        },
        onCancel: error => {
          params?.onCancel?.(error);
        },
      }),
    isRequestPending = status[StatusKeys.MessageSigning] === Status.IsLoading;

  return {
    openSignMessage,
    isRequestPending,
  };
});

export const useOpenSignMessageState = () => useAtomValue(openSignMessageState);

/** ------------------------------------------------------------------------------------------------------------------
 *  Sign structured message (derived state)
 *  ------------------------------------------------------------------------------------------------------------------
 */

export const openSignStructuredMessageState = atom(get => {
  const client = get(clientState);
  const status = get(statusAtom);

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
      client.signStructuredMessage({
        ...params,
        onFinish: payload => {
          params?.onFinish?.(payload);
        },
        onCancel: error => {
          params?.onCancel?.(error);
        },
      }),
    isRequestPending = status[StatusKeys.StructuredMessageSigning] === Status.IsLoading;

  return {
    openSignStructuredMessage,
    isRequestPending,
  };
});

export const useOpenSignStructuredMessageState = () => useAtomValue(openSignStructuredMessageState);

/** ------------------------------------------------------------------------------------------------------------------
 *  Sign structured message (derived state)
 *  ------------------------------------------------------------------------------------------------------------------
 */
interface StorageOptions {
  gaiaConfig?: GaiaConfig;
  disableEtagCache?: boolean;
}

const storageInstanceState = (options?: StorageOptions) =>
  atom(get => {
    const client = get(clientState);
    return new Storage({ client, ...options });
  });

export const storageState = (options: StorageOptions) =>
  atom(get => {
    const storage = get(storageInstanceState(options));
    return {
      getFile: storage.getFile,
      putFile: storage.putFile,
      listFile: storage.listFiles,
      deleteFile: storage.deleteFile,
    };
  });

export const atomWithModel = <T>(
  type: string,
  options?: {
    gaiaConfig?: GaiaConfig;
    disableEtagCache?: boolean;
    makeId?: (data: T) => string;
  }
) => {
  return atom(get => {
    return new Model({
      type,
      makeId: options?.makeId,
      adapter: createClientAdapter(
        get(
          storageInstanceState({
            gaiaConfig: options?.gaiaConfig,
            disableEtagCache: options?.disableEtagCache,
          })
        )
      ),
    });
  });
};

/** ------------------------------------------------------------------------------------------------------------------
 */
