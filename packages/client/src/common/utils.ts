import invariant from 'tiny-invariant';
import { MicroStacksErrors } from './errors';
import type { DehydratedState } from '@micro-stacks/client';

function makeMicroStacksMsg(msg: string) {
  return `[@micro-stacks/client] ${msg}`;
}

export function invariantWithMessage(
  condition: any,
  message: MicroStacksErrors
): asserts condition {
  invariant(condition, makeMicroStacksMsg(message));
}

export function cleanDehydratedState(dehydratedState: string): string;
export function cleanDehydratedState(dehydratedState: null): null;
export function cleanDehydratedState(dehydratedState?: string | null) {
  if (!dehydratedState) return null;
  const state = JSON.parse(dehydratedState) as DehydratedState;

  return JSON.stringify([
    state[0],
    [state[1][0], state[1][1].map(account => ({ ...account, appPrivateKey: null }))],
    state[2],
  ]);
}
