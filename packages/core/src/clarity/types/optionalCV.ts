import { ClarityType } from '../common/constants';
import { ClarityValue } from '../clarity-value/types';

export type OptionalCV<T extends ClarityValue> = NoneCV | SomeCV<T>;

export interface NoneCV {
  readonly type: ClarityType.OptionalNone;
}

export interface SomeCV<T extends ClarityValue = ClarityValue> {
  readonly type: ClarityType.OptionalSome;
  readonly value: T;
}

export function noneCV(): NoneCV {
  return { type: ClarityType.OptionalNone };
}

export function someCV<T extends ClarityValue = ClarityValue>(value: T): OptionalCV<T> {
  return { type: ClarityType.OptionalSome, value };
}

export function optionalCVOf<T extends ClarityValue = ClarityValue>(value?: T): OptionalCV<T> {
  return value ? someCV(value) : noneCV();
}
