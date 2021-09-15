import { ClarityType } from '../common/constants';
import { asciiToBytes, utf8ToBytes } from 'micro-stacks/common';
import { ClarityValue } from './types';

export function getCVTypeString(val: ClarityValue): string {
  switch (val.type) {
    case ClarityType.BoolTrue:
    case ClarityType.BoolFalse:
      return 'bool';
    case ClarityType.Int:
      return 'int';
    case ClarityType.UInt:
      return 'uint';
    case ClarityType.Buffer:
      return `(buff ${val.buffer.length})`;
    case ClarityType.OptionalNone:
      return '(optional none)';
    case ClarityType.OptionalSome:
      return `(optional ${getCVTypeString(val.value)})`;
    case ClarityType.ResponseErr:
      return `(response UnknownType ${getCVTypeString(val.value)})`;
    case ClarityType.ResponseOk:
      return `(response ${getCVTypeString(val.value)} UnknownType)`;
    case ClarityType.PrincipalStandard:
    case ClarityType.PrincipalContract:
      return 'principal';
    case ClarityType.List:
      return `(list ${val.list.length} ${
        val.list.length ? getCVTypeString(val.list[0]) : 'UnknownType'
      })`;
    case ClarityType.Tuple:
      return `(tuple ${Object.keys(val.data)
        .map(key => `(${key} ${getCVTypeString(val.data[key])})`)
        .join(' ')})`;
    case ClarityType.StringASCII:
      return `(string-ascii ${asciiToBytes(val.data).length})`;
    case ClarityType.StringUTF8:
      return `(string-utf8 ${utf8ToBytes(val.data).length})`;
  }
}
