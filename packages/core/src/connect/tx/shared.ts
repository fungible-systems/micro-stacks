import { bytesToHex } from 'micro-stacks/common';
import { PostCondition, serializePostCondition } from 'micro-stacks/transactions';

export function getOrFormatPostConditions(postConditions?: (string | PostCondition)[]) {
  return postConditions?.map(pc =>
    typeof pc !== 'string' ? bytesToHex(serializePostCondition(pc)) : pc
  );
}
