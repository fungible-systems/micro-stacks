import { AddressHashMode } from './common/constants';

import { deserializePublicKey, isCompressed, serializePublicKey, StacksPublicKey } from './keys';

import { rightPadHexToLength } from './common/utils';

import { deserializePayload, Payload, serializePayload } from './payload';
import {
  deserializeMessageSignature,
  deserializeTransactionAuthField,
  MessageSignature,
  serializeMessageSignature,
  serializeTransactionAuthField,
  TransactionAuthField,
} from './authorization';
import {
  BufferArray,
  BufferReader,
  bytesToHex,
  bytesToUtf8,
  DeserializationError,
  hexStringToInt,
  hexToBytes,
  intToHexString,
  TransactionVersion,
  utf8ToBytes,
} from 'micro-stacks/common';
import {
  hashP2PKH,
  hashP2SH,
  hashP2WPKH,
  hashP2WSH,
  StacksNetworkVersion,
} from 'micro-stacks/crypto';
import { deserializePostCondition, PostCondition, serializePostCondition } from './postcondition';
import {
  Address,
  AssetInfo,
  ContractPrincipal,
  createAddress,
  createLPString,
  deserializeAddress,
  deserializeLPString,
  exceedsMaxLengthBytes,
  LengthPrefixedString,
  MEMO_MAX_LENGTH_BYTES,
  PostConditionPrincipal,
  PostConditionPrincipalID,
  serializeAddress,
  serializeLPString,
  StacksMessageType,
  StandardPrincipal,
} from 'micro-stacks/clarity';

export type StacksMessage =
  | Address
  | PostConditionPrincipal
  | LengthPrefixedString
  | LengthPrefixedList
  | Payload
  | MemoString
  | AssetInfo
  | PostCondition
  | StacksPublicKey
  | TransactionAuthField
  | MessageSignature;

export function serializeStacksMessage(message: StacksMessage): Uint8Array {
  switch (message.type) {
    case StacksMessageType.Address:
      return serializeAddress(message);
    case StacksMessageType.Principal:
      return serializePrincipal(message);
    case StacksMessageType.LengthPrefixedString:
      return serializeLPString(message);
    case StacksMessageType.MemoString:
      return serializeMemoString(message);
    case StacksMessageType.AssetInfo:
      return serializeAssetInfo(message);
    case StacksMessageType.PostCondition:
      return serializePostCondition(message);
    case StacksMessageType.PublicKey:
      return serializePublicKey(message);
    case StacksMessageType.LengthPrefixedList:
      return serializeLPList(message);
    case StacksMessageType.Payload:
      return serializePayload(message);
    case StacksMessageType.TransactionAuthField:
      return serializeTransactionAuthField(message);
    case StacksMessageType.MessageSignature:
      return serializeMessageSignature(message);
  }
}

export function deserializeStacksMessage(
  bufferReader: BufferReader,
  type: StacksMessageType,
  listType?: StacksMessageType
): StacksMessage {
  switch (type) {
    case StacksMessageType.Address:
      return deserializeAddress(bufferReader);
    case StacksMessageType.Principal:
      return deserializePrincipal(bufferReader);
    case StacksMessageType.LengthPrefixedString:
      return deserializeLPString(bufferReader);
    case StacksMessageType.MemoString:
      return deserializeMemoString(bufferReader);
    case StacksMessageType.AssetInfo:
      return deserializeAssetInfo(bufferReader);
    case StacksMessageType.PostCondition:
      return deserializePostCondition(bufferReader);
    case StacksMessageType.PublicKey:
      return deserializePublicKey(bufferReader);
    case StacksMessageType.Payload:
      return deserializePayload(bufferReader);
    case StacksMessageType.LengthPrefixedList:
      if (!listType) {
        throw new DeserializationError('No List Type specified');
      }
      return deserializeLPList(bufferReader, listType);
    case StacksMessageType.MessageSignature:
      return deserializeMessageSignature(bufferReader);
    default:
      throw new Error('Could not recognize StacksMessageType');
  }
}

export function createEmptyAddress(): Address {
  return {
    type: StacksMessageType.Address,
    version: StacksNetworkVersion.mainnetP2PKH,
    hash160: '0'.repeat(40),
  };
}

export function addressFromVersionHash(version: StacksNetworkVersion, hash: string): Address {
  return { type: StacksMessageType.Address, version, hash160: hash };
}

/**
 * Translates the tx auth hash mode to the corresponding address version.
 * @see https://github.com/blockstack/stacks-blockchain/blob/master/sip/sip-005-blocks-and-transactions.md#transaction-authorization
 */
export function addressHashModeToVersion(
  hashMode: AddressHashMode,
  txVersion: TransactionVersion
): StacksNetworkVersion {
  switch (hashMode) {
    case AddressHashMode.SerializeP2PKH:
      switch (txVersion) {
        case TransactionVersion.Mainnet:
          return StacksNetworkVersion.mainnetP2PKH;
        case TransactionVersion.Testnet:
          return StacksNetworkVersion.testnetP2PKH;
        default:
          throw new Error(
            `Unexpected txVersion ${JSON.stringify(txVersion)} for hashMode ${hashMode}`
          );
      }
    case AddressHashMode.SerializeP2SH:
    case AddressHashMode.SerializeP2WPKH:
    case AddressHashMode.SerializeP2WSH:
      switch (txVersion) {
        case TransactionVersion.Mainnet:
          return StacksNetworkVersion.mainnetP2SH;
        case TransactionVersion.Testnet:
          return StacksNetworkVersion.testnetP2SH;
        default:
          throw new Error(
            `Unexpected txVersion ${JSON.stringify(txVersion)} for hashMode ${hashMode}`
          );
      }
    default:
      throw new Error(`Unexpected hashMode ${JSON.stringify(hashMode)}`);
  }
}

export function addressFromHashMode(
  hashMode: AddressHashMode,
  txVersion: TransactionVersion,
  data: string
): Address {
  const version = addressHashModeToVersion(hashMode, txVersion);
  return addressFromVersionHash(version, data);
}

export function addressFromPublicKeys(
  version: StacksNetworkVersion,
  hashMode: AddressHashMode,
  numSigs: number,
  publicKeys: StacksPublicKey[]
): Address {
  if (publicKeys.length === 0) {
    throw Error('Invalid number of public keys');
  }

  if (hashMode === AddressHashMode.SerializeP2PKH || hashMode === AddressHashMode.SerializeP2WPKH) {
    if (publicKeys.length !== 1 || numSigs !== 1) {
      throw Error('Invalid number of public keys or signatures');
    }
  }

  if (hashMode === AddressHashMode.SerializeP2WPKH || hashMode === AddressHashMode.SerializeP2WSH) {
    for (let i = 0; i < publicKeys.length; i++) {
      if (!isCompressed(publicKeys[i])) {
        throw Error('Public keys must be compressed for segwit');
      }
    }
  }

  switch (hashMode) {
    case AddressHashMode.SerializeP2PKH:
      return addressFromVersionHash(version, hashP2PKH(publicKeys[0].data));
    case AddressHashMode.SerializeP2WPKH:
      return addressFromVersionHash(version, hashP2WPKH(publicKeys[0].data));
    case AddressHashMode.SerializeP2SH:
      return addressFromVersionHash(version, hashP2SH(numSigs, publicKeys.map(serializePublicKey)));
    case AddressHashMode.SerializeP2WSH:
      return addressFromVersionHash(
        version,
        hashP2WSH(numSigs, publicKeys.map(serializePublicKey))
      );
  }
}

/**
 * Parses a principal string for either a standard principal or contract principal.
 * @param principalString - String in the format `{address}.{contractName}`
 * @example "SP13N5TE1FBBGRZD1FCM49QDGN32WAXM2E5F8WT2G.example-contract"
 * @example "SP13N5TE1FBBGRZD1FCM49QDGN32WAXM2E5F8WT2G"
 */
export function parsePrincipalString(
  principalString: string
): StandardPrincipal | ContractPrincipal {
  if (principalString.includes('.')) {
    const [address, contractName] = principalString.split('.');
    return createContractPrincipal(address, contractName);
  } else {
    return createStandardPrincipal(principalString);
  }
}

export function createStandardPrincipal(addressString: string): StandardPrincipal {
  return {
    type: StacksMessageType.Principal,
    prefix: PostConditionPrincipalID.Standard,
    address: createAddress(addressString),
  };
}

export function createContractPrincipal(
  addressString: string,
  contractName: string
): ContractPrincipal {
  return {
    type: StacksMessageType.Principal,
    prefix: PostConditionPrincipalID.Contract,
    contractName: createLPString(contractName),
    address: createAddress(addressString),
  };
}

export function serializePrincipal(principal: PostConditionPrincipal): Uint8Array {
  const bufferArray: BufferArray = new BufferArray();
  bufferArray.push(Uint8Array.from([principal.prefix]));
  bufferArray.push(serializeAddress(principal.address));
  if (principal.prefix === PostConditionPrincipalID.Contract) {
    bufferArray.push(serializeLPString(principal.contractName));
  }
  return bufferArray.concatBuffer();
}

export function deserializePrincipal(bufferReader: BufferReader): PostConditionPrincipal {
  const prefix = bufferReader.readUInt8Enum(PostConditionPrincipalID, _ => {
    throw new DeserializationError('Unexpected Principal payload type: ${n}');
  });
  const address = deserializeAddress(bufferReader);
  if (prefix === PostConditionPrincipalID.Standard) {
    return { type: StacksMessageType.Principal, prefix, address } as StandardPrincipal;
  }
  const contractName = deserializeLPString(bufferReader);
  return {
    type: StacksMessageType.Principal,
    prefix,
    address,
    contractName,
  } as ContractPrincipal;
}

export function codeBodyString(content: string): LengthPrefixedString {
  return createLPString(content, 4, 100000);
}

export interface MemoString {
  readonly type: StacksMessageType.MemoString;
  readonly content: string;
}

export function createMemoString(content: string): MemoString {
  if (content && exceedsMaxLengthBytes(content, MEMO_MAX_LENGTH_BYTES)) {
    throw new Error(`Memo exceeds maximum length of ${MEMO_MAX_LENGTH_BYTES.toString()} bytes`);
  }
  return { type: StacksMessageType.MemoString, content };
}

export function serializeMemoString(memoString: MemoString): Uint8Array {
  const bufferArray: BufferArray = new BufferArray();
  const contentBuffer = utf8ToBytes(memoString.content);
  const paddedContent = rightPadHexToLength(bytesToHex(contentBuffer), MEMO_MAX_LENGTH_BYTES * 2);
  bufferArray.push(hexToBytes(paddedContent));
  return bufferArray.concatBuffer();
}

export function deserializeMemoString(bufferReader: BufferReader): MemoString {
  const buff = bufferReader.readBuffer(MEMO_MAX_LENGTH_BYTES);
  const indexOfEmpty = buff.indexOf(0x00);
  const content = bytesToUtf8(buff.slice(0, indexOfEmpty));
  return { type: StacksMessageType.MemoString, content };
}

/**
 * Parse a fully qualified string that identifies the token type.
 * @param id - String in the format `{address}.{contractName}::{assetName}`
 * @example "SP13N5TE1FBBGRZD1FCM49QDGN32WAXM2E5F8WT2G.example-contract::example-token"
 */
export function parseAssetInfoString(id: string): AssetInfo {
  const [assetAddress, assetContractName, assetTokenName] = id.split(/\.|::/);
  return createAssetInfo(assetAddress, assetContractName, assetTokenName);
}

export function createAssetInfo(
  addressString: string,
  contractName: string,
  assetName: string
): AssetInfo {
  return {
    type: StacksMessageType.AssetInfo,
    address: createAddress(addressString),
    contractName: createLPString(contractName),
    assetName: createLPString(assetName),
  };
}

export function serializeAssetInfo(info: AssetInfo): Uint8Array {
  const bufferArray: BufferArray = new BufferArray();
  bufferArray.push(serializeAddress(info.address));
  bufferArray.push(serializeLPString(info.contractName));
  bufferArray.push(serializeLPString(info.assetName));
  return bufferArray.concatBuffer();
}

export function deserializeAssetInfo(bufferReader: BufferReader): AssetInfo {
  return {
    type: StacksMessageType.AssetInfo,
    address: deserializeAddress(bufferReader),
    contractName: deserializeLPString(bufferReader),
    assetName: deserializeLPString(bufferReader),
  };
}

export interface LengthPrefixedList {
  readonly type: StacksMessageType.LengthPrefixedList;
  readonly lengthPrefixBytes: number;
  readonly values: StacksMessage[];
}

export function createLPList<T extends StacksMessage>(
  values: T[],
  lengthPrefixBytes?: number
): LengthPrefixedList {
  return {
    type: StacksMessageType.LengthPrefixedList,
    lengthPrefixBytes: lengthPrefixBytes || 4,
    values,
  };
}

export function serializeLPList(lpList: LengthPrefixedList): Uint8Array {
  const list = lpList.values;
  const bufferArray: BufferArray = new BufferArray();
  bufferArray.appendHexString(intToHexString(list.length, lpList.lengthPrefixBytes));
  for (let index = 0; index < list.length; index++) {
    bufferArray.push(serializeStacksMessage(list[index]));
  }
  return bufferArray.concatBuffer();
}

export function deserializeLPList(
  bufferReader: BufferReader,
  type: StacksMessageType,
  lengthPrefixBytes?: number
): LengthPrefixedList {
  const length = hexStringToInt(bytesToHex(bufferReader.readBuffer(lengthPrefixBytes || 4)));
  const l: StacksMessage[] = [];
  for (let index = 0; index < length; index++) {
    switch (type) {
      case StacksMessageType.Address:
        l.push(deserializeAddress(bufferReader));
        break;
      case StacksMessageType.LengthPrefixedString:
        l.push(deserializeLPString(bufferReader));
        break;
      case StacksMessageType.MemoString:
        l.push(deserializeMemoString(bufferReader));
        break;
      case StacksMessageType.AssetInfo:
        l.push(deserializeAssetInfo(bufferReader));
        break;
      case StacksMessageType.PostCondition:
        l.push(deserializePostCondition(bufferReader));
        break;
      case StacksMessageType.PublicKey:
        l.push(deserializePublicKey(bufferReader));
        break;
      case StacksMessageType.TransactionAuthField:
        l.push(deserializeTransactionAuthField(bufferReader));
        break;
    }
  }
  return createLPList(l, lengthPrefixBytes);
}
