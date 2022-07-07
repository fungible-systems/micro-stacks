import {
  asciiToBytes,
  BufferArray,
  compare,
  hexToBytes,
  intToHexString,
  toTwos,
  utf8ToBytes,
  writeUInt32BE,
  concatByteArrays,
} from 'micro-stacks/common';

import { ClarityType } from './common/constants';
import { BooleanCV } from './types/booleanCV';
import { IntCV, UIntCV } from './types/intCV';
import { BufferCV } from './types/bufferCV';
import { OptionalCV } from './types/optionalCV';
import { ResponseCV } from './types/responseCV';
import { ContractPrincipalCV, StandardPrincipalCV } from './types/principalCV';
import { ListCV } from './types/listCV';
import { TupleCV } from './types/tupleCV';
import { StringAsciiCV, StringUtf8CV } from './types/stringCV';
import { createLPString, serializeAddress, serializeLPString } from './common/utils';
import { ClarityValue } from './clarity-value/types';

function bufferWithTypeID(typeId: ClarityType, buffer: Uint8Array): Uint8Array {
  const buffers = new BufferArray();
  const id = Uint8Array.from([typeId]);
  buffers.push(id);
  buffers.push(buffer);
  return buffers.concatBuffer();
}

function serializeBoolCV(value: BooleanCV): Uint8Array {
  return Uint8Array.from([value.type]);
}

function serializeOptionalCV(cv: OptionalCV<ClarityValue>): Uint8Array {
  if (cv.type === ClarityType.OptionalNone) {
    return new Uint8Array([cv.type]);
  } else {
    return bufferWithTypeID(cv.type, serializeCV(cv.value));
  }
}

function serializeBufferCV(cv: BufferCV): Uint8Array {
  const length = new Uint8Array(4);
  const view = new DataView(length.buffer, length.byteOffset, length.byteLength);

  view.setUint32(length.byteOffset, cv.buffer.length);
  return bufferWithTypeID(cv.type, concatByteArrays([length, Uint8Array.from(cv.buffer)]));
}

function serializeIntCV(cv: IntCV): Uint8Array {
  const hex = intToHexString(toTwos(cv.value), 16);
  const buffer = hexToBytes(hex);
  return bufferWithTypeID(cv.type, buffer);
}

function serializeUIntCV(cv: UIntCV): Uint8Array {
  const hex = intToHexString(cv.value, 16);
  const buffer = hexToBytes(hex);
  return bufferWithTypeID(cv.type, buffer);
}

function serializeStandardPrincipalCV(cv: StandardPrincipalCV): Uint8Array {
  return bufferWithTypeID(cv.type, serializeAddress(cv.address));
}

function serializeContractPrincipalCV(cv: ContractPrincipalCV): Uint8Array {
  return bufferWithTypeID(
    cv.type,
    concatByteArrays([serializeAddress(cv.address), serializeLPString(cv.contractName)])
  );
}

function serializeResponseCV(cv: ResponseCV) {
  return bufferWithTypeID(cv.type, serializeCV(cv.value));
}

function serializeListCV(cv: ListCV) {
  const buffers = new BufferArray();

  const length = new Uint8Array(4);
  writeUInt32BE(length, cv.list.length, 0);
  buffers.push(length);

  for (const value of cv.list) {
    const serializedValue = serializeCV(value);
    buffers.push(serializedValue);
  }

  return bufferWithTypeID(cv.type, buffers.concatBuffer());
}

function serializeTupleCV(cv: TupleCV) {
  const buffers = [];

  const length = new Uint8Array(4);
  const view = new DataView(length.buffer, length.byteOffset, length.byteLength);
  view.setUint32(length.byteOffset, Object.keys(cv.data).length);

  buffers.push(length);

  const lexicographicOrder = Object.keys(cv.data).sort((a, b) => {
    const bufA = utf8ToBytes(a);
    const bufB = utf8ToBytes(b);
    return compare(bufA, bufB);
  });

  for (const key of lexicographicOrder) {
    const nameWithLength = createLPString(key);
    buffers.push(serializeLPString(nameWithLength));

    const serializedValue = serializeCV(cv.data[key]);
    buffers.push(serializedValue);
  }

  return bufferWithTypeID(cv.type, concatByteArrays(buffers));
}

function serializeStringCV(cv: StringAsciiCV | StringUtf8CV, encoding: 'ascii' | 'utf8') {
  const buffers = new BufferArray();
  const toBytes = encoding === 'ascii' ? asciiToBytes : utf8ToBytes;
  const str = toBytes(cv.data);
  const len = new Uint8Array(4);
  const view = new DataView(len.buffer, len.byteOffset, len.byteLength);

  view.setUint32(len.byteOffset, str.length);

  buffers.push(len);
  buffers.push(str);
  return bufferWithTypeID(cv.type, buffers.concatBuffer());
}

function serializeStringAsciiCV(cv: StringAsciiCV) {
  return serializeStringCV(cv, 'ascii');
}

function serializeStringUtf8CV(cv: StringUtf8CV) {
  return serializeStringCV(cv, 'utf8');
}

export function serializeCV(value: ClarityValue): Uint8Array {
  switch (value.type) {
    case ClarityType.BoolTrue:
    case ClarityType.BoolFalse:
      return serializeBoolCV(value);
    case ClarityType.OptionalNone:
    case ClarityType.OptionalSome:
      return serializeOptionalCV(value);
    case ClarityType.Buffer:
      return serializeBufferCV(value);
    case ClarityType.Int:
      return serializeIntCV(value);
    case ClarityType.UInt:
      return serializeUIntCV(value);
    case ClarityType.PrincipalStandard:
      return serializeStandardPrincipalCV(value);
    case ClarityType.PrincipalContract:
      return serializeContractPrincipalCV(value);
    case ClarityType.ResponseOk:
    case ClarityType.ResponseErr:
      return serializeResponseCV(value);
    case ClarityType.List:
      return serializeListCV(value);
    case ClarityType.Tuple:
      return serializeTupleCV(value);
    case ClarityType.StringASCII:
      return serializeStringAsciiCV(value);
    case ClarityType.StringUTF8:
      return serializeStringUtf8CV(value);
    default:
      throw new Error('Unable to serialize. Invalid Clarity Value.');
  }
}
