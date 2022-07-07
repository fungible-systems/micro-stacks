import type { FinishedTxData } from 'micro-stacks/connect';

export interface OptionalParams {
  onFinish?: (payload: FinishedTxData) => void;
  onCancel?: (error?: string) => void;
}
