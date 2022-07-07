import { OptionalParams } from '../common/types';
import { ContractCallParams, Status, StatusKeys, TxType } from '@micro-stacks/client';
import { FinishedTxData } from 'micro-stacks/connect';
import { useMicroStacksClient } from './use-client';
import { useStatuses } from './use-statuses';
import { useCallback, useMemo } from 'react';

/** ------------------------------------------------------------------------------------------------------------------
 *   Types
 *  ------------------------------------------------------------------------------------------------------------------
 */

interface UseOpenContractCall {
  openContractCall: (params: ContractCallParams) => Promise<FinishedTxData | undefined>;
  isRequestPending: boolean;
}

/** ------------------------------------------------------------------------------------------------------------------
 *   useOpenContractCall hook
 *  ------------------------------------------------------------------------------------------------------------------
 */

export const useOpenContractCall = (callbacks?: OptionalParams): UseOpenContractCall => {
  const client = useMicroStacksClient();
  const status = useStatuses();

  const openContractCall = useCallback(
      (params: ContractCallParams) =>
        client.signTransaction(TxType.ContractCall, {
          ...params,
          onFinish: payload => {
            params?.onFinish?.(payload);
            callbacks?.onFinish?.(payload);
          },
          onCancel: error => {
            params?.onCancel?.(error);
            callbacks?.onCancel?.(error);
          },
        }),
      [client, callbacks]
    ),
    isRequestPending = useMemo(
      () => status[StatusKeys.TransactionSigning] === Status.IsLoading,
      [status]
    );

  return {
    openContractCall,
    isRequestPending,
  };
};
