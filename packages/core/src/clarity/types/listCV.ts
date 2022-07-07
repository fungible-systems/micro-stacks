import { ClarityType } from '../common/constants';
import { ClarityValue } from '../clarity-value/types';

interface ListCV<T extends ClarityValue = ClarityValue> {
  type: ClarityType.List;
  list: T[];
}

function listCV<T extends ClarityValue = ClarityValue>(values: T[]): ListCV<T> {
  return { type: ClarityType.List, list: values };
}

export { ListCV, listCV };
