import { useCallback, useMemo } from 'react';
import { useStatuses } from './use-statuses';
import { useMicroStacksClient } from './use-client';
import { OpenSignMessageParams, Status, StatusKeys } from '@micro-stacks/client';
import type { SignatureData, SignedOptionsWithOnHandlers } from 'micro-stacks/connect';

/** ------------------------------------------------------------------------------------------------------------------
 *   Types
 *  ------------------------------------------------------------------------------------------------------------------
 */

export interface UseOpenSignMessage {
  openSignMessage: (
    params: SignedOptionsWithOnHandlers<{ message: string }>
  ) => Promise<SignatureData | undefined>;
  isRequestPending: boolean;
}

/** ------------------------------------------------------------------------------------------------------------------
 *   useOpenSignMessage hook
 *  ------------------------------------------------------------------------------------------------------------------
 */

export const useOpenSignMessage = (
  callbacks?: SignedOptionsWithOnHandlers<{}>
): UseOpenSignMessage => {
  const client = useMicroStacksClient();
  const status = useStatuses();

  const openSignMessage = useCallback(
      async (params: OpenSignMessageParams) =>
        client.signMessage({
          message: params.message,
          onFinish: payload => {
            params?.onFinish?.(payload);
            callbacks?.onFinish?.(payload);
          },
          onCancel: payload => {
            params?.onCancel?.(payload);
            callbacks?.onCancel?.(payload);
          },
        }),
      [client, callbacks]
    ),
    isRequestPending = useMemo(
      () => status[StatusKeys.MessageSigning] === Status.IsLoading,
      [status]
    );

  return {
    openSignMessage,
    isRequestPending,
  };
};
