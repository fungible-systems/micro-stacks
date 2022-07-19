import { ClarityType } from './common/constants';
import { falseCV, trueCV } from './types/booleanCV';
import { intCV, uintCV } from './types/intCV';
import { bufferCV } from './types/bufferCV';
import { noneCV, someCV } from './types/optionalCV';
import { responseErrorCV, responseOkCV } from './types/responseCV';
import {
  contractPrincipalCVFromAddress,
  standardPrincipalCVFromAddress,
} from './types/principalCV';
import { listCV } from './types/listCV';
import { tupleCV } from './types/tupleCV';
import { stringAsciiCV, stringUtf8CV } from './types/stringCV';
import { deserializeAddress, deserializeLPString } from './common/utils';

import {
  BufferReader,
  bytesToAscii,
  bytesToUtf8,
  DeserializationError,
  hexToBytes,
} from 'micro-stacks/common';
import { ClarityValue } from './clarity-value/types';

export function deserializeCV<T extends ClarityValue = ClarityValue>(
  serializedClarityValue: BufferReader | Uint8Array | string
): T {
  let bufferReader: BufferReader;
  if (typeof serializedClarityValue === 'string') {
    const hasHexPrefix = serializedClarityValue.slice(0, 2).toLowerCase() === '0x';
    bufferReader = new BufferReader(
      hexToBytes(hasHexPrefix ? serializedClarityValue.slice(2) : serializedClarityValue)
    );
  } else if (serializedClarityValue instanceof Uint8Array) {
    bufferReader = new BufferReader(serializedClarityValue);
  } else {
    bufferReader = serializedClarityValue;
  }
  const type = bufferReader.readUInt8Enum(ClarityType, n => {
    throw new DeserializationError(`Cannot recognize Clarity Type: ${n}`);
  });

  switch (type) {
    case ClarityType.Int:
      return intCV(bufferReader.readBuffer(16)) as T;

    case ClarityType.UInt:
      return uintCV(bufferReader.readBuffer(16)) as T;

    case ClarityType.Buffer:
      const bufferLength = bufferReader.readUInt32BE();
      return bufferCV(bufferReader.readBuffer(bufferLength)) as T;

    case ClarityType.BoolTrue:
      return trueCV() as T;

    case ClarityType.BoolFalse:
      return falseCV() as T;

    case ClarityType.PrincipalStandard:
      const sAddress = deserializeAddress(bufferReader);
      return standardPrincipalCVFromAddress(sAddress) as T;

    case ClarityType.PrincipalContract:
      const cAddress = deserializeAddress(bufferReader);
      const contractName = deserializeLPString(bufferReader);
      return contractPrincipalCVFromAddress(cAddress, contractName) as T;

    case ClarityType.ResponseOk:
      return responseOkCV(deserializeCV(bufferReader)) as T;

    case ClarityType.ResponseErr:
      return responseErrorCV(deserializeCV(bufferReader)) as T;

    case ClarityType.OptionalNone:
      return noneCV() as T;

    case ClarityType.OptionalSome:
      return someCV(deserializeCV(bufferReader)) as T;

    case ClarityType.List:
      const listLength = bufferReader.readUInt32BE();
      const listContents: ClarityValue[] = [];
      for (let i = 0; i < listLength; i++) {
        listContents.push(deserializeCV(bufferReader));
      }
      return listCV(listContents) as T;

    case ClarityType.Tuple:
      const tupleLength = bufferReader.readUInt32BE();
      const tupleContents: { [key: string]: ClarityValue } = {};
      for (let i = 0; i < tupleLength; i++) {
        const clarityName = deserializeLPString(bufferReader).content;
        if (clarityName === undefined) {
          throw new DeserializationError('"content" is undefined');
        }
        tupleContents[clarityName] = deserializeCV(bufferReader);
      }
      return tupleCV(tupleContents) as T;

    case ClarityType.StringASCII:
      const asciiStrLen = bufferReader.readUInt32BE();
      const asciiStr = bytesToAscii(bufferReader.readBuffer(asciiStrLen));
      return stringAsciiCV(asciiStr) as T;

    case ClarityType.StringUTF8:
      const utf8StrLen = bufferReader.readUInt32BE();
      const utf8Str = bytesToUtf8(bufferReader.readBuffer(utf8StrLen));
      return stringUtf8CV(utf8Str) as T;

    default:
      throw new DeserializationError(
        'Unable to deserialize Clarity Value from buffer. Could not find valid Clarity Type.'
      );
  }
}
