import { ClarityType } from '../common/constants';
import { principalToString } from '../types/principalCV';
import { ClarityValue } from './types';
/**
 * @param val - ClarityValue
 * @param strictJsonCompat If true then ints and uints are returned as JSON serializable numbers when
 * less than or equal to 53 bit length, otherwise string wrapped integers when larger than 53 bits.
 * If false, they are returned as js native `bigint`s which are _not_ JSON serializable.
 */
export function cvToTrueValue<T = unknown>(val: ClarityValue, strictJsonCompat = false): T {
  switch (val.type) {
    case ClarityType.BoolTrue:
      return true as unknown as T;
    case ClarityType.BoolFalse:
      return false as unknown as T;
    case ClarityType.Int:
    case ClarityType.UInt:
      if (strictJsonCompat) return val.value.toString() as unknown as T;
      return val.value as unknown as T;
    case ClarityType.Buffer:
      return val.buffer as unknown as T;
    case ClarityType.OptionalNone:
      return null as unknown as T;
    case ClarityType.OptionalSome:
      return cvToTrueValue(val.value);
    case ClarityType.ResponseErr:
      return cvToTrueValue(val.value);
    case ClarityType.ResponseOk:
      return cvToTrueValue(val.value);
    case ClarityType.PrincipalStandard:
    case ClarityType.PrincipalContract:
      return principalToString(val) as unknown as T;
    case ClarityType.List:
      return val.list.map(v => cvToTrueValue<T>(v)) as unknown as T;
    case ClarityType.Tuple:
      const result: { [key: string]: any } = {};
      Object.keys(val.data).forEach(key => {
        result[key] = cvToTrueValue<T>(val.data[key]);
      });
      return result as T;
    case ClarityType.StringASCII:
      return val.data as unknown as T;
    case ClarityType.StringUTF8:
      return val.data as unknown as T;
  }
}
