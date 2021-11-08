import { ClarityType } from '../common/constants';
import { bytesToHex } from 'micro-stacks/common';
import { principalToString } from '../types/principalCV';
import { cvToJSON } from './cv-to-json';
import { ClarityValue } from './types';

/**
 * @param val - ClarityValue
 * @param strictJsonCompat If true then ints and uints are returned as JSON serializable numbers when
 * less than or equal to 53 bit length, otherwise string wrapped integers when larger than 53 bits.
 * If false, they are returned as js native `bigint`s which are _not_ JSON serializable.
 */
export function cvToValue(val: ClarityValue, strictJsonCompat = false): any {
  switch (val.type) {
    case ClarityType.BoolTrue:
      return true;
    case ClarityType.BoolFalse:
      return false;
    case ClarityType.Int:
    case ClarityType.UInt:
      if (strictJsonCompat) return val.value.toString();
      return val.value;
    case ClarityType.Buffer:
      return `0x${bytesToHex(val.buffer)}`;
    case ClarityType.OptionalNone:
      return null;
    case ClarityType.OptionalSome:
      return cvToJSON(val.value);
    case ClarityType.ResponseErr:
      return cvToJSON(val.value);
    case ClarityType.ResponseOk:
      return cvToJSON(val.value);
    case ClarityType.PrincipalStandard:
    case ClarityType.PrincipalContract:
      return principalToString(val);
    case ClarityType.List:
      return val.list.map(v => cvToJSON(v));
    case ClarityType.Tuple:
      const result: { [key: string]: any } = {};
      const arr = Object.keys(val.data).map(key => {
        return [key, cvToJSON(val.data[key])];
      });
      arr.forEach(([key, value]) => {
        result[key as any] = value;
      });
      return result;
    case ClarityType.StringASCII:
      return val.data;
    case ClarityType.StringUTF8:
      return val.data;
  }
}
