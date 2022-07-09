import type { SignatureData, SignedOptionsWithOnHandlers } from 'micro-stacks/connect';
import { getClient } from './store';
import { derived, Readable } from 'svelte/store';
import { Status, StatusKeys } from '@micro-stacks/client';
import { watchStatuses } from './status';
import { ClarityValue } from 'micro-stacks/clarity';
import { ChainID } from 'micro-stacks/network';

/** ------------------------------------------------------------------------------------------------------------------
 *   Simple message signing
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
  const client = getClient();

  return derived([watchStatuses()], ([$status]) => {
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
    const isRequestPending = $status[StatusKeys.MessageSigning] === Status.IsLoading;

    return {
      openSignMessage,
      isRequestPending,
    };
  });
}

/** ------------------------------------------------------------------------------------------------------------------
 *  Structured message signing
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
  const client = getClient();

  return derived([watchStatuses()], ([$status]) => {
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
    const isRequestPending = $status[StatusKeys.StructuredMessageSigning] === Status.IsLoading;

    return { openSignStructuredMessage, isRequestPending };
  });
}
