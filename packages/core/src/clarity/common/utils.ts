import { c32address, c32addressDecode, StacksNetworkVersion } from 'micro-stacks/crypto';
import {
  BufferArray,
  BufferReader,
  bytesToHex,
  bytesToUtf8,
  hexStringToInt,
  hexToBytes,
  intToHexString,
  utf8ToBytes,
} from 'micro-stacks/common';
import { MAX_STRING_LENGTH_BYTES, PostConditionPrincipalID } from './constants';

export function isClarityName(name: string) {
  const regex = /^[a-zA-Z]([a-zA-Z0-9]|[-_!?+<>=/*])*$|^[-+=/*]$|^[<>]=?$/;
  return regex.test(name) && name.length < 128;
}

export enum StacksMessageType {
  Address,
  Principal,
  LengthPrefixedString,
  MemoString,
  AssetInfo,
  PostCondition,
  PublicKey,
  LengthPrefixedList,
  Payload,
  MessageSignature,
  TransactionAuthField,
}

export interface Address {
  readonly type: StacksMessageType.Address;
  readonly version: StacksNetworkVersion;
  readonly hash160: string;
}

export function createAddress(c32AddressString: string): Address {
  const addressData = c32addressDecode(c32AddressString);
  return {
    type: StacksMessageType.Address,
    version: addressData[0],
    hash160: bytesToHex(addressData[1]),
  };
}

export function addressToString(address: Address): string {
  return c32address(address.version, hexToBytes(address.hash160));
}

export interface LengthPrefixedString {
  readonly type: StacksMessageType.LengthPrefixedString;
  readonly content: string;
  readonly lengthPrefixBytes: number;
  readonly maxLengthBytes: number;
}

export const exceedsMaxLengthBytes = (string: string, maxLengthBytes: number): boolean =>
  string ? utf8ToBytes(string).length > maxLengthBytes : false;

export function createLPString(content: string): LengthPrefixedString;
export function createLPString(content: string, lengthPrefixBytes: number): LengthPrefixedString;
export function createLPString(
  content: string,
  lengthPrefixBytes: number,
  maxLengthBytes: number
): LengthPrefixedString;
export function createLPString(
  content: string,
  lengthPrefixBytes?: number,
  maxLengthBytes?: number
): LengthPrefixedString {
  const prefixLength = lengthPrefixBytes || 1;
  const maxLength = maxLengthBytes || MAX_STRING_LENGTH_BYTES;
  if (exceedsMaxLengthBytes(content, maxLength)) {
    throw new Error(`String length exceeds maximum bytes ${maxLength.toString()}`);
  }
  return {
    type: StacksMessageType.LengthPrefixedString,
    content,
    lengthPrefixBytes: prefixLength,
    maxLengthBytes: maxLength,
  };
}

export function serializeAddress(address: Address): Uint8Array {
  const bufferArray: BufferArray = new BufferArray();
  bufferArray.appendHexString(intToHexString(address.version, 1));
  bufferArray.appendHexString(address.hash160);

  return bufferArray.concatBuffer();
}

export function serializeLPString(lps: LengthPrefixedString) {
  const bufferArray: BufferArray = new BufferArray();
  const contentBuffer = utf8ToBytes(lps.content); // is this hex?
  const length = contentBuffer.byteLength;
  bufferArray.appendHexString(intToHexString(length, lps.lengthPrefixBytes));
  bufferArray.push(contentBuffer);
  return bufferArray.concatBuffer();
}

export function deserializeLPString(
  bufferReader: BufferReader,
  prefixBytes?: number,
  maxLength?: number
): LengthPrefixedString {
  prefixBytes = prefixBytes ? prefixBytes : 1;
  const length = hexStringToInt(bytesToHex(bufferReader.readBuffer(prefixBytes)));
  const content = bytesToUtf8(bufferReader.readBuffer(length));
  return createLPString(content, prefixBytes, maxLength ?? 128);
}

export function deserializeAddress(bufferReader: BufferReader): Address {
  const version = hexStringToInt(bytesToHex(bufferReader.readBuffer(1)));
  const data = bytesToHex(bufferReader.readBuffer(20));

  return { type: StacksMessageType.Address, version, hash160: data };
}

export interface StandardPrincipal {
  readonly type: StacksMessageType.Principal;
  readonly prefix: PostConditionPrincipalID.Standard;
  readonly address: Address;
}

export interface ContractPrincipal {
  readonly type: StacksMessageType.Principal;
  readonly prefix: PostConditionPrincipalID.Contract;
  readonly address: Address;
  readonly contractName: LengthPrefixedString;
}

export type PostConditionPrincipal = StandardPrincipal | ContractPrincipal;

export interface AssetInfo {
  readonly type: StacksMessageType.AssetInfo;
  readonly address: Address;
  readonly contractName: LengthPrefixedString;
  readonly assetName: LengthPrefixedString;
}
