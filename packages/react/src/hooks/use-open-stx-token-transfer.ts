import { OptionalParams } from '../common/types';
import { Status, StatusKeys, StxTransferParams, TxType } from '@micro-stacks/client';
import { FinishedTxData } from 'micro-stacks/connect';
import { useMicroStacksClient } from './use-client';
import { useStatuses } from './use-statuses';
import { useCallback, useMemo } from 'react';

/** ------------------------------------------------------------------------------------------------------------------
 *   Types
 *  ------------------------------------------------------------------------------------------------------------------
 */

interface UseOpenStxTokenTransfer {
  openStxTokenTransfer: (params: StxTransferParams) => Promise<FinishedTxData | undefined>;
  isRequestPending: boolean;
}

/** ------------------------------------------------------------------------------------------------------------------
 *   useOpenStxTokenTransfer hook
 *  ------------------------------------------------------------------------------------------------------------------
 */

export const useOpenStxTokenTransfer = (callbacks?: OptionalParams): UseOpenStxTokenTransfer => {
  const client = useMicroStacksClient();
  const status = useStatuses();
  const openStxTokenTransfer = useCallback(
      (params: StxTransferParams) =>
        client.signTransaction(TxType.TokenTransfer, {
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
    openStxTokenTransfer,
    isRequestPending,
  };
};
