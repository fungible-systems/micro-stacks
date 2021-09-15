import { ClarityType } from '../common/constants';

export type BooleanCV = TrueCV | FalseCV;

export interface TrueCV {
  type: ClarityType.BoolTrue;
}

export interface FalseCV {
  type: ClarityType.BoolFalse;
}

export const trueCV = (): BooleanCV => ({ type: ClarityType.BoolTrue });
export const falseCV = (): BooleanCV => ({ type: ClarityType.BoolFalse });
