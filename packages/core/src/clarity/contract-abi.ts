import {
  ClarityValue,
  uintCV,
  intCV,
  contractPrincipalCV,
  standardPrincipalCV,
  noneCV,
  bufferCV,
  falseCV,
  trueCV,
  ClarityType,
  bufferCVFromString,
  stringAsciiCV,
  stringUtf8CV,
  ClarityAbiFunction,
  ClarityAbiType,
  ClarityAbiTypePrimitive,
  ClarityAbiTypeBuffer,
  ClarityAbiTypeStringAscii,
  ClarityAbiTypeStringUtf8,
  ClarityAbiTypeResponse,
  ClarityAbiTypeOptional,
  ClarityAbiTypeTuple,
  ClarityAbiTypeList,
  ClarityAbiTypeId,
  ClarityAbiTypeUnion,
} from '../clarity';
import { utf8ToBytes, cloneDeep, NotImplementedError } from 'micro-stacks/common';

export const isClarityAbiPrimitive = (val: ClarityAbiType): val is ClarityAbiTypePrimitive =>
  typeof val === 'string';
export const isClarityAbiBuffer = (val: ClarityAbiType): val is ClarityAbiTypeBuffer =>
  (val as ClarityAbiTypeBuffer).buffer !== undefined;
export const isClarityAbiStringAscii = (val: ClarityAbiType): val is ClarityAbiTypeStringAscii =>
  (val as ClarityAbiTypeStringAscii)['string-ascii'] !== undefined;
export const isClarityAbiStringUtf8 = (val: ClarityAbiType): val is ClarityAbiTypeStringUtf8 =>
  (val as ClarityAbiTypeStringUtf8)['string-utf8'] !== undefined;
export const isClarityAbiResponse = (val: ClarityAbiType): val is ClarityAbiTypeResponse =>
  (val as ClarityAbiTypeResponse).response !== undefined;
export const isClarityAbiOptional = (val: ClarityAbiType): val is ClarityAbiTypeOptional =>
  (val as ClarityAbiTypeOptional).optional !== undefined;
export const isClarityAbiTuple = (val: ClarityAbiType): val is ClarityAbiTypeTuple =>
  (val as ClarityAbiTypeTuple).tuple !== undefined;
export const isClarityAbiList = (val: ClarityAbiType): val is ClarityAbiTypeList =>
  (val as ClarityAbiTypeList).list !== undefined;

export function getTypeUnion(val: ClarityAbiType): ClarityAbiTypeUnion {
  if (isClarityAbiPrimitive(val)) {
    if (val === 'uint128') {
      return { id: ClarityAbiTypeId.ClarityAbiTypeUInt128, type: val };
    } else if (val === 'int128') {
      return { id: ClarityAbiTypeId.ClarityAbiTypeInt128, type: val };
    } else if (val === 'bool') {
      return { id: ClarityAbiTypeId.ClarityAbiTypeBool, type: val };
    } else if (val === 'principal') {
      return { id: ClarityAbiTypeId.ClarityAbiTypePrincipal, type: val };
    } else if (val === 'trait_reference') {
      return { id: ClarityAbiTypeId.ClarityAbiTypeTraitReference, type: val };
    } else if (val === 'none') {
      return { id: ClarityAbiTypeId.ClarityAbiTypeNone, type: val };
    } else {
      throw new Error(`Unexpected Clarity ABI type primitive: ${JSON.stringify(val)}`);
    }
  } else if (isClarityAbiBuffer(val)) {
    return { id: ClarityAbiTypeId.ClarityAbiTypeBuffer, type: val };
  } else if (isClarityAbiResponse(val)) {
    return { id: ClarityAbiTypeId.ClarityAbiTypeResponse, type: val };
  } else if (isClarityAbiOptional(val)) {
    return { id: ClarityAbiTypeId.ClarityAbiTypeOptional, type: val };
  } else if (isClarityAbiTuple(val)) {
    return { id: ClarityAbiTypeId.ClarityAbiTypeTuple, type: val };
  } else if (isClarityAbiList(val)) {
    return { id: ClarityAbiTypeId.ClarityAbiTypeList, type: val };
  } else if (isClarityAbiStringAscii(val)) {
    return { id: ClarityAbiTypeId.ClarityAbiTypeStringAscii, type: val };
  } else if (isClarityAbiStringUtf8(val)) {
    return { id: ClarityAbiTypeId.ClarityAbiTypeStringUtf8, type: val };
  } else {
    throw new Error(`Unexpected Clarity ABI type: ${JSON.stringify(val)}`);
  }
}

export function encodeClarityValue(type: ClarityAbiType, val: string): ClarityValue;
export function encodeClarityValue(type: ClarityAbiTypeUnion, val: string): ClarityValue;
export function encodeClarityValue(
  input: ClarityAbiTypeUnion | ClarityAbiType,
  val: string
): ClarityValue {
  let union: ClarityAbiTypeUnion;
  if ((input as ClarityAbiTypeUnion).id !== undefined) {
    union = input as ClarityAbiTypeUnion;
  } else {
    union = getTypeUnion(input as ClarityAbiType);
  }
  switch (union.id) {
    case ClarityAbiTypeId.ClarityAbiTypeUInt128:
      return uintCV(val);
    case ClarityAbiTypeId.ClarityAbiTypeInt128:
      return intCV(val);
    case ClarityAbiTypeId.ClarityAbiTypeBool:
      if (val === 'false' || val === '0') return falseCV();
      else if (val === 'true' || val === '1') return trueCV();
      else throw new Error(`Unexpected Clarity bool value: ${JSON.stringify(val)}`);
    case ClarityAbiTypeId.ClarityAbiTypePrincipal:
      if (val.includes('.')) {
        const [addr, name] = val.split('.');
        return contractPrincipalCV(addr, name);
      } else {
        return standardPrincipalCV(val);
      }
    case ClarityAbiTypeId.ClarityAbiTypeTraitReference:
      const [addr, name] = val.split('.');
      return contractPrincipalCV(addr, name);
    case ClarityAbiTypeId.ClarityAbiTypeNone:
      return noneCV();
    case ClarityAbiTypeId.ClarityAbiTypeBuffer:
      return bufferCV(utf8ToBytes(val));
    case ClarityAbiTypeId.ClarityAbiTypeStringAscii:
      return stringAsciiCV(val);
    case ClarityAbiTypeId.ClarityAbiTypeStringUtf8:
      return stringUtf8CV(val);
    case ClarityAbiTypeId.ClarityAbiTypeResponse:
      throw new NotImplementedError(`Unsupported encoding for Clarity type: ${union.id}`);
    case ClarityAbiTypeId.ClarityAbiTypeOptional:
      throw new NotImplementedError(`Unsupported encoding for Clarity type: ${union.id}`);
    case ClarityAbiTypeId.ClarityAbiTypeTuple:
      throw new NotImplementedError(`Unsupported encoding for Clarity type: ${union.id}`);
    case ClarityAbiTypeId.ClarityAbiTypeList:
      throw new NotImplementedError(`Unsupported encoding for Clarity type: ${union.id}`);
    default:
      throw new Error(`Unexpected Clarity type ID: ${JSON.stringify(union)}`);
  }
}

export function getTypeString(val: ClarityAbiType): string {
  if (isClarityAbiPrimitive(val)) {
    if (val === 'int128') {
      return 'int';
    } else if (val === 'uint128') {
      return 'uint';
    }
    return val;
  } else if (isClarityAbiBuffer(val)) {
    return `(buff ${val.buffer.length})`;
  } else if (isClarityAbiStringAscii(val)) {
    return `(string-ascii ${val['string-ascii'].length})`;
  } else if (isClarityAbiStringUtf8(val)) {
    return `(string-utf8 ${val['string-utf8'].length})`;
  } else if (isClarityAbiResponse(val)) {
    return `(response ${getTypeString(val.response.ok)} ${getTypeString(val.response.error)})`;
  } else if (isClarityAbiOptional(val)) {
    return `(optional ${getTypeString(val.optional)})`;
  } else if (isClarityAbiTuple(val)) {
    return `(tuple ${val.tuple.map(t => `(${t.name} ${getTypeString(t.type)})`).join(' ')})`;
  } else if (isClarityAbiList(val)) {
    return `(list ${val.list.length} ${getTypeString(val.list.type)})`;
  } else {
    throw new Error(`Type string unsupported for Clarity type: ${JSON.stringify(val)}`);
  }
}

export function abiFunctionToString(func: ClarityAbiFunction): string {
  const access = func.access === 'read_only' ? 'read-only' : func.access;
  return `(define-${access} (${func.name} ${func.args
    .map(arg => `(${arg.name} ${getTypeString(arg.type)})`)
    .join(' ')}))`;
}

export function matchClarityType(cv: ClarityValue, abiType: ClarityAbiType): boolean {
  const union = getTypeUnion(abiType);

  switch (cv.type) {
    case ClarityType.BoolTrue:
    case ClarityType.BoolFalse:
      return union.id === ClarityAbiTypeId.ClarityAbiTypeBool;
    case ClarityType.Int:
      return union.id === ClarityAbiTypeId.ClarityAbiTypeInt128;
    case ClarityType.UInt:
      return union.id === ClarityAbiTypeId.ClarityAbiTypeUInt128;
    case ClarityType.Buffer:
      return (
        union.id === ClarityAbiTypeId.ClarityAbiTypeBuffer &&
        union.type.buffer.length >= cv.buffer.length
      );
    case ClarityType.StringASCII:
      return (
        union.id === ClarityAbiTypeId.ClarityAbiTypeStringAscii &&
        union.type['string-ascii'].length >= cv.data.length
      );
    case ClarityType.StringUTF8:
      return (
        union.id === ClarityAbiTypeId.ClarityAbiTypeStringUtf8 &&
        union.type['string-utf8'].length >= cv.data.length
      );
    case ClarityType.OptionalNone:
      return (
        union.id === ClarityAbiTypeId.ClarityAbiTypeNone ||
        union.id === ClarityAbiTypeId.ClarityAbiTypeOptional
      );
    case ClarityType.OptionalSome:
      return (
        union.id === ClarityAbiTypeId.ClarityAbiTypeOptional &&
        matchClarityType(cv.value, union.type.optional)
      );
    case ClarityType.ResponseErr:
      return (
        union.id === ClarityAbiTypeId.ClarityAbiTypeResponse &&
        matchClarityType(cv.value, union.type.response.error)
      );
    case ClarityType.ResponseOk:
      return (
        union.id === ClarityAbiTypeId.ClarityAbiTypeResponse &&
        matchClarityType(cv.value, union.type.response.ok)
      );
    case ClarityType.PrincipalContract:
      return (
        union.id === ClarityAbiTypeId.ClarityAbiTypePrincipal ||
        union.id === ClarityAbiTypeId.ClarityAbiTypeTraitReference
      );
    case ClarityType.PrincipalStandard:
      return union.id === ClarityAbiTypeId.ClarityAbiTypePrincipal;
    case ClarityType.List:
      return (
        union.id == ClarityAbiTypeId.ClarityAbiTypeList &&
        union.type.list.length >= cv.list.length &&
        cv.list.every(val => matchClarityType(val, union.type.list.type))
      );
    case ClarityType.Tuple:
      if (union.id == ClarityAbiTypeId.ClarityAbiTypeTuple) {
        const tuple = cloneDeep(cv.data);
        for (let i = 0; i < union.type.tuple.length; i++) {
          const abiTupleEntry = union.type.tuple[i];
          const key = abiTupleEntry.name;
          const val = tuple[key];

          // if key exists in cv tuple, check if its type matches the abi
          // return false if key doesn't exist
          if (val) {
            if (!matchClarityType(val, abiTupleEntry.type)) {
              return false;
            }
            delete tuple[key];
          } else {
            return false;
          }
        }
        return true;
      } else {
        return false;
      }
    default:
      return false;
  }
}

/**
 * Convert string input to Clarity value based on contract ABI data. Only handles Clarity
 * primitives and buffers. Responses, optionals, tuples and lists are not supported.
 *
 * @param {string} input - string to be parsed into Clarity value
 * @param {ClarityAbiType} type - the contract function argument object
 *
 * @returns {ClarityValue} returns a Clarity value
 */
export function parseToCV(input: string, type: ClarityAbiType): ClarityValue {
  const typeString = getTypeString(type);
  if (isClarityAbiPrimitive(type)) {
    if (type === 'uint128') {
      return uintCV(input);
    } else if (type === 'int128') {
      return intCV(input);
    } else if (type === 'bool') {
      if (input.toLowerCase() === 'true') {
        return trueCV();
      } else if (input.toLowerCase() === 'false') {
        return falseCV();
      } else {
        throw new Error(`Invalid bool value: ${input}`);
      }
    } else if (type === 'principal') {
      if (input.includes('.')) {
        const [address, contractName] = input.split('.');
        return contractPrincipalCV(address, contractName);
      } else {
        return standardPrincipalCV(input);
      }
    } else {
      throw new Error(`Contract function contains unsupported Clarity ABI type: ${typeString}`);
    }
  } else if (isClarityAbiBuffer(type)) {
    const inputLength = utf8ToBytes(input).byteLength;
    if (inputLength > type.buffer.length) {
      throw new Error(`Input exceeds specified buffer length limit of ${type.buffer.length}`);
    }
    return bufferCVFromString(input);
  } else if (isClarityAbiResponse(type)) {
    throw new Error(`Contract function contains unsupported Clarity ABI type: ${typeString}`);
  } else if (isClarityAbiOptional(type)) {
    throw new Error(`Contract function contains unsupported Clarity ABI type: ${typeString}`);
  } else if (isClarityAbiTuple(type)) {
    throw new Error(`Contract function contains unsupported Clarity ABI type: ${typeString}`);
  } else if (isClarityAbiList(type)) {
    throw new Error(`Contract function contains unsupported Clarity ABI type: ${typeString}`);
  } else {
    throw new Error(`Contract function contains unsupported Clarity ABI type: ${typeString}`);
  }
}
