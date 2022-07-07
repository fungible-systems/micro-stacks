import { PubKeyEncoding } from './common/constants';

import { leftPadHexToLength } from './common/utils';

import { getPublicKey as nobleGetPublicKey, utils, Point, Signature, sign } from '@noble/secp256k1';

import { MessageSignature, createMessageSignature } from './authorization';

import {
  BufferArray,
  BufferReader,
  bytesToHex,
  hexToBigInt,
  hexToBytes,
  intToHex,
  concatByteArrays,
  intToHexString,
  hexStringToInt,
} from 'micro-stacks/common';
import {
  COMPRESSED_PUBKEY_LENGTH_BYTES,
  StacksMessageType,
  UNCOMPRESSED_PUBKEY_LENGTH_BYTES,
} from 'micro-stacks/clarity';

export interface StacksPublicKey {
  readonly type: StacksMessageType.PublicKey;
  readonly data: Uint8Array;
}

export function createStacksPublicKey(key: string): StacksPublicKey {
  return {
    type: StacksMessageType.PublicKey,
    data: hexToBytes(key),
  };
}

export function publicKeyFromSignature(
  message: string,
  messageSignature: MessageSignature,
  pubKeyEncoding = PubKeyEncoding.Compressed,
  mode = 'vrs' as 'vrs' | 'rsv'
): string {
  const parsedSignature = parseRecoverableSignature(messageSignature.data, mode);
  const signature = new Signature(hexToBigInt(parsedSignature.r), hexToBigInt(parsedSignature.s));
  const point = Point.fromSignature(message, signature, parsedSignature.recoveryParam);
  const isCompressed = pubKeyEncoding === PubKeyEncoding.Compressed;
  return point.toHex(isCompressed);
}

export function publicKeyFromBuffer(data: Uint8Array): StacksPublicKey {
  return { type: StacksMessageType.PublicKey, data };
}

export function publicKeyToString(key: StacksPublicKey): string {
  return bytesToHex(key.data);
}

export function isCompressed(key: StacksPublicKey): boolean {
  const hex = publicKeyToString(key);
  return !hex.startsWith('04');
}

export function isPrivateKeyCompressed(key: string | Uint8Array) {
  const data = typeof key === 'string' ? hexToBytes(key) : key;
  let compressed = false;
  if (data.length === 33) {
    if (data[data.length - 1] !== 1) {
      throw new Error(
        'Improperly formatted private-key. 33 byte length usually ' +
          'indicates compressed key, but last byte must be == 0x01'
      );
    }
    compressed = true;
  }
  return compressed;
}

export function serializePublicKey(key: StacksPublicKey): Uint8Array {
  const bufferArray: BufferArray = new BufferArray();
  bufferArray.push(key.data);
  return bufferArray.concatBuffer();
}

export function pubKeyfromPrivKey(privateKey: string | Uint8Array): StacksPublicKey {
  const privKey = createStacksPrivateKey(privateKey);
  const isCompressed = isPrivateKeyCompressed(privateKey);
  const pubKey = nobleGetPublicKey(privKey.data.slice(0, 32), isCompressed || privKey.compressed);
  return createStacksPublicKey(bytesToHex(pubKey));
}

export function compressPublicKey(publicKey: string | Uint8Array): StacksPublicKey {
  const hex = typeof publicKey === 'string' ? publicKey : bytesToHex(publicKey);
  const compressed = Point.fromHex(hex).toHex(true);
  return createStacksPublicKey(compressed);
}

export function deserializePublicKey(bufferReader: BufferReader): StacksPublicKey {
  const fieldId = bufferReader.readUInt8();
  const keyLength =
    fieldId !== 4 ? COMPRESSED_PUBKEY_LENGTH_BYTES : UNCOMPRESSED_PUBKEY_LENGTH_BYTES;
  return publicKeyFromBuffer(
    concatByteArrays([Uint8Array.from([fieldId]), bufferReader.readBuffer(keyLength)])
  );
}

export interface StacksPrivateKey {
  data: Uint8Array;
  compressed: boolean;
}

export function createStacksPrivateKey(key: string | Uint8Array): StacksPrivateKey {
  const data = typeof key === 'string' ? hexToBytes(key) : key;
  let compressed: boolean;
  if (data.length === 33) {
    if (data[data.length - 1] !== 1) {
      throw new Error(
        'Improperly formatted private-key. 33 byte length usually ' +
          'indicates compressed key, but last byte must be == 0x01'
      );
    }
    compressed = true;
  } else if (data.length === 32) {
    compressed = false;
  } else {
    throw new Error(
      `Improperly formatted private-key hex string: length should be 32 or 33 bytes, provided with length ${data.length}`
    );
  }
  return { data, compressed };
}

export function makeRandomPrivKey(): StacksPrivateKey {
  return createStacksPrivateKey(utils.randomPrivateKey());
}

export async function signWithKey(
  privateKey: StacksPrivateKey,
  input: string
): Promise<MessageSignature> {
  const [rawSignature, recoveryParam] = await sign(input, privateKey.data.slice(0, 32), {
    canonical: true,
    recovered: true,
    // https://github.com/paulmillr/noble-secp256k1#signmsghash-privatekey
    // additional entropy k' for deterministic signature, follows section 3.6 of RFC6979. When true, it would automatically be filled with 32 bytes of cryptographically secure entropy
    // TODO: how can we make this default true?
    // extraEntropy: false,
  });

  const signature = Signature.fromHex(rawSignature);

  const coordinateValueBytes = 32;
  const r = leftPadHexToLength(intToHex(signature.r), coordinateValueBytes * 2);
  const s = leftPadHexToLength(intToHex(signature.s), coordinateValueBytes * 2);

  if (recoveryParam === undefined || recoveryParam === null) {
    throw new Error('"signature.recoveryParam" is not set');
  }
  const recoveryParamHex = intToHexString(recoveryParam, 1);
  const recoverableSignatureString = recoveryParamHex + r + s;
  return createMessageSignature(recoverableSignatureString);
}

export function getSignatureRecoveryParam(signature: string) {
  const coordinateValueBytes = 32;
  if (signature.length < coordinateValueBytes * 2 * 2 + 1) {
    throw new Error('Invalid signature');
  }
  const recoveryParamHex = signature.substr(0, 2);
  return hexStringToInt(recoveryParamHex);
}

export function parseRecoverableSignature(signature: string, mode = 'vrs' as 'vrs' | 'rsv') {
  const coordinateValueBytes = 32;
  if (signature.length < coordinateValueBytes * 2 * 2 + 1) {
    throw new Error('Invalid signature');
  }
  if (mode === 'vrs') {
    const recoveryParamHex = signature.substr(0, 2);
    const r = signature.substr(2, coordinateValueBytes * 2);
    const s = signature.substr(2 + coordinateValueBytes * 2, coordinateValueBytes * 2);
    return {
      recoveryParam: hexStringToInt(recoveryParamHex),
      r,
      s,
    };
  }
  const r = signature.substr(0, coordinateValueBytes * 2);
  const s = signature.substr(coordinateValueBytes * 2, coordinateValueBytes * 2);
  const recoveryParamHex = signature.substr(coordinateValueBytes * 2 * 2, 2);
  return {
    r,
    s,
    recoveryParam: hexStringToInt(recoveryParamHex),
  };
}

export function getPublicKeyFromStacksPrivateKey(privateKey: StacksPrivateKey): StacksPublicKey {
  return pubKeyfromPrivKey(privateKey.data);
}

export function privateKeyToString(privateKey: StacksPrivateKey): string {
  return bytesToHex(privateKey.data);
}
