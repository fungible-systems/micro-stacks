import { SignatureData, SignedOptionsWithOnHandlers } from 'micro-stacks/connect';
import { useMicroStacksClient } from './use-client';
import { useStatuses } from './use-statuses';
import { useCallback, useMemo } from 'react';
import { OpenSignStructuredMessageParams, Status, StatusKeys } from '@micro-stacks/client';

/** ------------------------------------------------------------------------------------------------------------------
 *   Types
 *  ------------------------------------------------------------------------------------------------------------------
 */

export interface UseOpenSignStructuredMessage {
  openSignStructuredMessage: (
    params: OpenSignStructuredMessageParams
  ) => Promise<SignatureData | undefined>;
  isRequestPending: boolean;
}

/** ------------------------------------------------------------------------------------------------------------------
 *   useOpenSignStructuredMessage hook
 *  ------------------------------------------------------------------------------------------------------------------
 */

export const useOpenSignStructuredMessage = (
  callbacks?: SignedOptionsWithOnHandlers<{}>
): UseOpenSignStructuredMessage => {
  const client = useMicroStacksClient();
  const status = useStatuses();

  const openSignStructuredMessage = useCallback(
      (params: OpenSignStructuredMessageParams) =>
        client.signStructuredMessage({
          message: params.message,
          domain: params.domain,
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
      () => status[StatusKeys.StructuredMessageSigning] === Status.IsLoading,
      [status]
    );

  return { openSignStructuredMessage, isRequestPending };
};
