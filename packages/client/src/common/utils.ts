import invariant from 'tiny-invariant';
import { MicroStacksErrors } from './errors';

function makeMicroStacksMsg(msg: string) {
  return `[@micro-stacks/client] ${msg}`;
}

export function invariantWithMessage(
  condition: any,
  message: MicroStacksErrors
): asserts condition {
  invariant(condition, makeMicroStacksMsg(message));
}
