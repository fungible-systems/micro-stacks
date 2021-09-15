import { StacksProvider } from 'micro-stacks/connect';
import { getGlobalObject } from 'micro-stacks/common';

export function getStacksProvider() {
  const Provider: StacksProvider | undefined = getGlobalObject('StacksProvider', {
    returnEmptyObject: false,
    usageDesc: 'authenticate',
    throwIfUnavailable: true,
  });
  return Provider;
}
