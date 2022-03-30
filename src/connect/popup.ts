import { getStacksProvider } from './common/get-stacks-provider';

import type { StacksTransaction } from 'micro-stacks/transactions';
import type { StacksProvider } from './common/provider';

export interface FinishedTxData {
  stacksTransaction: StacksTransaction;
  txRaw: string;
  txId: string;
}

export async function openTransactionPopup(options: {
  token: string;
  onFinish?: (payload: FinishedTxData) => void;
  onCancel?: (errorMessage?: string) => void;
}) {
  const { token, onFinish, onCancel } = options;
  try {
    const Provider: StacksProvider | undefined = getStacksProvider();
    const data = await Provider!.transactionRequest(token);
    onFinish?.(data);
  } catch (e) {
    console.error(e);
    // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
    onCancel?.((e as unknown as any)?.message);
  }
}

export async function openProfileUpdatePopup(options: {
  token: string;
  onFinish?: (payload: string) => void;
  onCancel?: (errorMessage?: string) => void;
}) {
  const { token, onFinish, onCancel } = options;
  try {
    const Provider: StacksProvider | undefined = getStacksProvider();
    if (!Provider) {
      console.error('no stacks provider');
    }
    const data = await Provider!.profileUpdateRequest(token);
    onFinish?.(data);
  } catch (e) {
    console.error(e);
    // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
    onCancel?.((e as unknown as any)?.message);
  }
}
