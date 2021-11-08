import { ClarityType } from '../common/constants';
import { principalToString } from '../types/principalCV';
import { ClarityValue } from './types';

export function cvToTrueValue(val: ClarityValue, strictJsonCompat = false): any {
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
      return val.buffer;
    case ClarityType.OptionalNone:
      return null;
    case ClarityType.OptionalSome:
      return cvToTrueValue(val.value);
    case ClarityType.ResponseErr:
      return cvToTrueValue(val.value);
    case ClarityType.ResponseOk:
      return cvToTrueValue(val.value);
    case ClarityType.PrincipalStandard:
    case ClarityType.PrincipalContract:
      return principalToString(val);
    case ClarityType.List:
      return val.list.map(v => cvToTrueValue(v));
    case ClarityType.Tuple:
      const result: { [key: string]: any } = {};
      Object.keys(val.data).forEach(key => {
        result[key] = cvToTrueValue(val.data[key]);
      });
      return result;
    case ClarityType.StringASCII:
      return val.data;
    case ClarityType.StringUTF8:
      return val.data;
  }
}
