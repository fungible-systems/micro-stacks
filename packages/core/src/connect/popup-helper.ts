import { StacksProvider } from './common/provider';
import { getStacksProvider } from './common/get-stacks-provider';

export function genericTransactionPopupFactory<OnFinishedPayload, ErrorMessagePayload = string>(
  method: keyof StacksProvider
) {
  return async function fn(options: {
    token: string;
    onFinish?: (payload: OnFinishedPayload) => void;
    onCancel?: (errorMessage?: ErrorMessagePayload) => void;
  }) {
    const { token, onFinish, onCancel } = options;
    try {
      const Provider: StacksProvider | undefined = getStacksProvider();
      if (!Provider) throw new Error('[micro-stacks/connect] No Stacks provider');

      const fn = Provider[method];

      if (typeof fn !== 'function')
        throw new Error(`[micro-stacks/connect] StacksProvider method ${method} not found`);

      const responsePayload = await fn(token);

      onFinish?.(responsePayload as unknown as OnFinishedPayload);
    } catch (e) {
      // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
      onCancel?.((e as unknown as any)?.message);
    }
  };
}
