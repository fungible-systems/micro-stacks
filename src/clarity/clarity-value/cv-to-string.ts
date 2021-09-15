import { ClarityType } from '../common/constants';
import { bytesToAscii, bytesToHex } from 'micro-stacks/common';
import { principalToString } from '../types/principalCV';
import { ClarityValue } from './types';

export async function cvToString(
  val: ClarityValue,
  encoding: 'tryAscii' | 'hex' = 'hex'
): Promise<string | bigint> {
  switch (val.type) {
    case ClarityType.BoolTrue:
      return 'true';
    case ClarityType.BoolFalse:
      return 'false';
    case ClarityType.Int:
      return val.value.toString();
    case ClarityType.UInt:
      return `u${val.value.toString()}`;
    case ClarityType.Buffer:
      if (encoding === 'tryAscii') {
        const str = bytesToAscii(val.buffer);
        if (/[ -~]/.test(str)) {
          return JSON.stringify(str);
        }
      }
      return `0x${bytesToHex(val.buffer)}`;
    case ClarityType.OptionalNone:
      return 'none';
    case ClarityType.OptionalSome:
      return `(some ${await cvToString(val.value, encoding)})`;
    case ClarityType.ResponseErr:
      return `(err ${await cvToString(val.value, encoding)})`;
    case ClarityType.ResponseOk:
      return `(ok ${await cvToString(val.value, encoding)})`;
    case ClarityType.PrincipalStandard:
    case ClarityType.PrincipalContract:
      return principalToString(val);
    case ClarityType.List:
      return `(list ${(await Promise.all(val.list.map(async v => cvToString(v, encoding)))).join(
        ' '
      )})`;
    case ClarityType.Tuple:
      return `(tuple ${(
        await Promise.all(
          Object.keys(val.data).map(
            async key => `(${key} ${await cvToString(val.data[key], encoding)})`
          )
        )
      ).join(' ')})`;
    case ClarityType.StringASCII:
      return `"${val.data}"`;
    case ClarityType.StringUTF8:
      return `u"${val.data}"`;
  }
}
