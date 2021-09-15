import {
  createMemoString,
  serializeStacksMessage,
  deserializeMemoString,
  codeBodyString,
  MemoString,
} from './types';
import {
  Address,
  ClarityValue,
  COINBASE_BUFFER_LENGTH_BYTES,
  createAddress,
  createLPString,
  deserializeAddress,
  deserializeCV,
  deserializeLPString,
  LengthPrefixedString,
  principalCV,
  PrincipalCV,
  serializeCV,
  StacksMessageType,
} from 'micro-stacks/clarity';
import {
  BufferArray,
  BufferReader,
  writeUInt32BE,
  IntegerType,
  intToBigInt,
  intToBytes,
} from 'micro-stacks/common';

export type Payload =
  | TokenTransferPayload
  | ContractCallPayload
  | SmartContractPayload
  | PoisonPayload
  | CoinbasePayload;

export enum PayloadType {
  TokenTransfer = 0x00,
  SmartContract = 0x01,
  ContractCall = 0x02,
  PoisonMicroblock = 0x03,
  Coinbase = 0x04,
}

export interface TokenTransferPayload {
  readonly type: StacksMessageType.Payload;
  readonly payloadType: PayloadType.TokenTransfer;
  readonly recipient: PrincipalCV;
  readonly amount: bigint;
  readonly memo: MemoString;
}

export type PayloadInput =
  | (TokenTransferPayload | (Omit<TokenTransferPayload, 'amount'> & { amount: IntegerType }))
  | ContractCallPayload
  | SmartContractPayload
  | PoisonPayload
  | CoinbasePayload;

export function createTokenTransferPayload(
  recipient: string | PrincipalCV,
  amount: IntegerType,
  memo?: string | MemoString
): TokenTransferPayload {
  if (typeof recipient === 'string') {
    recipient = principalCV(recipient);
  }
  if (typeof memo === 'string') {
    memo = createMemoString(memo);
  }

  return {
    type: StacksMessageType.Payload,
    payloadType: PayloadType.TokenTransfer,
    recipient,
    amount: intToBigInt(amount, false),
    memo: memo ?? createMemoString(''),
  };
}

export interface ContractCallPayload {
  readonly type: StacksMessageType.Payload;
  readonly payloadType: PayloadType.ContractCall;
  readonly contractAddress: Address;
  readonly contractName: LengthPrefixedString;
  readonly functionName: LengthPrefixedString;
  readonly functionArgs: ClarityValue[];
}

export function createContractCallPayload(
  contractAddress: string | Address,
  contractName: string | LengthPrefixedString,
  functionName: string | LengthPrefixedString,
  functionArgs: ClarityValue[]
): ContractCallPayload {
  if (typeof contractAddress === 'string') {
    contractAddress = createAddress(contractAddress);
  }
  if (typeof contractName === 'string') {
    contractName = createLPString(contractName);
  }
  if (typeof functionName === 'string') {
    functionName = createLPString(functionName);
  }

  return {
    type: StacksMessageType.Payload,
    payloadType: PayloadType.ContractCall,
    contractAddress,
    contractName,
    functionName,
    functionArgs,
  };
}

export interface SmartContractPayload {
  readonly type: StacksMessageType.Payload;
  readonly payloadType: PayloadType.SmartContract;
  readonly contractName: LengthPrefixedString;
  readonly codeBody: LengthPrefixedString;
}

export function createSmartContractPayload(
  contractName: string | LengthPrefixedString,
  codeBody: string | LengthPrefixedString
): SmartContractPayload {
  if (typeof contractName === 'string') {
    contractName = createLPString(contractName);
  }
  if (typeof codeBody === 'string') {
    codeBody = codeBodyString(codeBody);
  }

  return {
    type: StacksMessageType.Payload,
    payloadType: PayloadType.SmartContract,
    contractName,
    codeBody,
  };
}

export interface PoisonPayload {
  readonly type: StacksMessageType.Payload;
  readonly payloadType: PayloadType.PoisonMicroblock;
}

export function createPoisonPayload(): PoisonPayload {
  return { type: StacksMessageType.Payload, payloadType: PayloadType.PoisonMicroblock };
}

export interface CoinbasePayload {
  readonly type: StacksMessageType.Payload;
  readonly payloadType: PayloadType.Coinbase;
  readonly coinbaseBuffer: Uint8Array;
}

export function createCoinbasePayload(coinbaseBuffer: Uint8Array): CoinbasePayload {
  if (coinbaseBuffer.byteLength != COINBASE_BUFFER_LENGTH_BYTES) {
    throw Error(`Coinbase buffer size must be ${COINBASE_BUFFER_LENGTH_BYTES} bytes`);
  }
  return { type: StacksMessageType.Payload, payloadType: PayloadType.Coinbase, coinbaseBuffer };
}

export function serializePayload(payload: PayloadInput): Uint8Array {
  const bufferArray: BufferArray = new BufferArray();
  bufferArray.appendByte(payload.payloadType);

  switch (payload.payloadType) {
    case PayloadType.TokenTransfer:
      bufferArray.push(serializeCV(payload.recipient));
      bufferArray.push(intToBytes(payload.amount, false, 8));
      bufferArray.push(serializeStacksMessage(payload.memo));
      break;
    case PayloadType.ContractCall:
      bufferArray.push(serializeStacksMessage(payload.contractAddress));
      bufferArray.push(serializeStacksMessage(payload.contractName));
      bufferArray.push(serializeStacksMessage(payload.functionName));
      const numArgs = new Uint8Array(4);
      writeUInt32BE(numArgs, payload.functionArgs.length, 0);
      bufferArray.push(numArgs);
      payload.functionArgs.forEach(arg => {
        bufferArray.push(serializeCV(arg));
      });
      break;
    case PayloadType.SmartContract:
      bufferArray.push(serializeStacksMessage(payload.contractName));
      bufferArray.push(serializeStacksMessage(payload.codeBody));
      break;
    case PayloadType.PoisonMicroblock:
      // TODO: implement
      break;
    case PayloadType.Coinbase:
      bufferArray.push(payload.coinbaseBuffer);
      break;
  }

  return bufferArray.concatBuffer();
}

export function deserializePayload(bufferReader: BufferReader): Payload {
  const payloadType = bufferReader.readUInt8Enum(PayloadType, n => {
    throw new Error(`Cannot recognize PayloadType: ${n}`);
  });

  switch (payloadType) {
    case PayloadType.TokenTransfer:
      const recipient = deserializeCV(bufferReader) as PrincipalCV;
      const amount = intToBigInt(bufferReader.readBuffer(8), false);
      const memo = deserializeMemoString(bufferReader);
      return createTokenTransferPayload(recipient, amount, memo);
    case PayloadType.ContractCall:
      const contractAddress = deserializeAddress(bufferReader);
      const contractCallName = deserializeLPString(bufferReader);
      const functionName = deserializeLPString(bufferReader);
      const functionArgs = [];
      const numberOfArgs = bufferReader.readUInt32BE();
      for (let i = 0; i < numberOfArgs; i++) {
        const clarityValue = deserializeCV(bufferReader);
        functionArgs.push(clarityValue);
      }
      return createContractCallPayload(
        contractAddress,
        contractCallName,
        functionName,
        functionArgs
      );
    case PayloadType.SmartContract:
      const smartContractName = deserializeLPString(bufferReader);
      const codeBody = deserializeLPString(bufferReader, 4, 100000);
      return createSmartContractPayload(smartContractName, codeBody);
    case PayloadType.PoisonMicroblock:
      // TODO: implement
      return createPoisonPayload();
    case PayloadType.Coinbase:
      const coinbaseBuffer = bufferReader.readBuffer(COINBASE_BUFFER_LENGTH_BYTES);
      return createCoinbasePayload(coinbaseBuffer);
  }
}
