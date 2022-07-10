import {
  ContractCallParams,
  ContractDeployParams,
  Status,
  StatusKeys,
  StxTransferParams,
  TxType
} from '@micro-stacks/client';
import { FinishedTxData } from 'micro-stacks/connect';
import { derived, Readable } from 'svelte/store';

import { watchStatuses } from './status';
import { useMicroStacksClient } from './context';

export interface OptionalParams {
  onFinish?: (payload: FinishedTxData) => void;
  onCancel?: (error?: string) => void;
}

/** ------------------------------------------------------------------------------------------------------------------
 *   Stx token transfer
 *  ------------------------------------------------------------------------------------------------------------------
 */

export function getOpenStxTokenTransfer(callbacks?: OptionalParams) {
  const client = useMicroStacksClient();

  return derived([watchStatuses()], ([status]) => {
    const openStxTokenTransfer = (params: StxTransferParams) =>
      client.signTransaction(TxType.TokenTransfer, {
        ...params,
        onFinish: (payload: FinishedTxData) => {
          params?.onFinish?.(payload);
          callbacks?.onFinish?.(payload);
        },
        onCancel: (error: string | undefined) => {
          params?.onCancel?.(error);
          callbacks?.onCancel?.(error);
        }
      });
    const isRequestPending = status[StatusKeys.TransactionSigning] === Status.IsLoading;

    return {
      openStxTokenTransfer,
      isRequestPending
    };
  });
}

/** ------------------------------------------------------------------------------------------------------------------
 *   Contract call
 *  ------------------------------------------------------------------------------------------------------------------
 */

interface OpenContractCall {
  openContractCall: (params: ContractCallParams) => Promise<FinishedTxData | undefined>;
  isRequestPending: boolean;
}

export function getOpenContractCall(
  callbacks?: OptionalParams
): Readable<OpenContractCall> {
  const client = useMicroStacksClient();

  return derived([watchStatuses()], ([$status]) => {
    const openContractCall = (params: ContractCallParams) =>
      client.signTransaction(TxType.ContractCall, {
        ...params,
        onFinish: (payload: FinishedTxData) => {
          params?.onFinish?.(payload);
          callbacks?.onFinish?.(payload);
        },
        onCancel: (error: string | undefined) => {
          params?.onCancel?.(error);
          callbacks?.onCancel?.(error);
        }
      });
    const isRequestPending = $status[StatusKeys.TransactionSigning] === Status.IsLoading;

    return {
      openContractCall,
      isRequestPending
    };
  });
}

/** ------------------------------------------------------------------------------------------------------------------
 *   Contract deploy
 *  ------------------------------------------------------------------------------------------------------------------
 */

interface OpenContractDeploy {
  openContractDeploy: (
    params: ContractDeployParams
  ) => Promise<FinishedTxData | undefined>;
  isRequestPending: boolean;
}

export function getOpenContractDeploy(
  callbacks?: OptionalParams
): Readable<OpenContractDeploy> {
  const client = useMicroStacksClient();

  return derived([watchStatuses()], ([$status]) => {
    const openContractDeploy = (params: ContractDeployParams) =>
      client.signTransaction(TxType.ContractDeploy, {
        ...params,
        onFinish: (payload: FinishedTxData) => {
          params?.onFinish?.(payload);
          callbacks?.onFinish?.(payload);
        },
        onCancel: (error: string | undefined) => {
          params?.onCancel?.(error);
          callbacks?.onCancel?.(error);
        }
      });
    const isRequestPending = $status[StatusKeys.TransactionSigning] === Status.IsLoading;

    return {
      openContractDeploy,
      isRequestPending
    };
  });
}
