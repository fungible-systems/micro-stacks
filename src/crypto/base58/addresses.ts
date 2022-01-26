import { getPublicKey } from 'micro-stacks/crypto';
import { BufferArray, bytesToHex, ensureHexBytes, hexToBytes } from 'micro-stacks/common';
import { hashSha256 } from 'micro-stacks/crypto-sha';

import { base58checkEncode } from './index';
import { networks } from './networks';
import { hashRipemd160 } from '../ripemd160/hashRipemd160';
import { c32address, StacksNetworkVersion } from '../c32';

export function privateKeyToStxAddress(
  privateKey: string | Uint8Array,
  addressVersion: StacksNetworkVersion = StacksNetworkVersion.mainnetP2PKH,
  isCompressed?: boolean
): string {
  return publicKeyToStxAddress(
    bytesToHex(getPublicKey(ensureHexBytes(privateKey), isCompressed)),
    addressVersion
  );
}

export function publicKeyToStxAddress(
  publicKey: string | Uint8Array,
  addressVersion: StacksNetworkVersion = StacksNetworkVersion.mainnetP2PKH
): string {
  return c32address(addressVersion, hash160(ensureHexBytes(publicKey)));
}

export function privateKeyToBase58Address(privateKey: string) {
  const publicKey = getPublicKey(privateKey, true);
  const sha256 = hashSha256(publicKey);
  const hash160 = hashRipemd160(sha256);
  return base58checkEncode(hash160, networks.bitcoin.pubKeyHash);
}

export function publicKeyToBase58Address(publicKey: string | Uint8Array) {
  const pk = typeof publicKey === 'string' ? publicKey : bytesToHex(publicKey);
  const sha256 = hashSha256(hexToBytes(pk));
  const hash160 = hashRipemd160(sha256);
  return base58checkEncode(hash160, networks.bitcoin.pubKeyHash);
}

function hash160(input: Uint8Array): Uint8Array {
  const sha256 = hashSha256(input);
  return hashRipemd160(sha256);
}

export const hashP2PKH = (input: Uint8Array): string => {
  return bytesToHex(hash160(input));
};

// Internally, the Stacks blockchain encodes address the same as Bitcoin
// single-sig address over p2sh (p2h-p2wpkh)
export const hashP2WPKH = (input: Uint8Array): string => {
  const keyHash = hash160(input);

  const bufferArray = new BufferArray();
  bufferArray.appendByte(0);
  bufferArray.appendByte(keyHash.length);
  bufferArray.push(keyHash);

  const redeemScript = bufferArray.concatBuffer();
  const redeemScriptHash = hash160(redeemScript);
  return bytesToHex(redeemScriptHash);
};

// Internally, the Stacks blockchain encodes address the same as Bitcoin
// multisig address over p2sh (p2sh-p2wsh)
export const hashP2WSH = (numSigs: number, pubKeys: Uint8Array[]): string => {
  if (numSigs > 15 || pubKeys.length > 15) {
    throw Error('P2WSH multisig address can only contain up to 15 public keys');
  }

  // construct P2SH script
  const scriptArray = new BufferArray();
  // OP_n
  scriptArray.appendByte(80 + numSigs);
  // public keys prepended by their length
  pubKeys.forEach(pubKey => {
    scriptArray.appendByte(pubKey.length);
    scriptArray.push(pubKey);
  });
  // OP_m
  scriptArray.appendByte(80 + pubKeys.length);
  // OP_CHECKMULTISIG
  scriptArray.appendByte(174);

  const script = scriptArray.concatBuffer();
  const digest = hashSha256(script);

  const bufferArray = new BufferArray();
  bufferArray.appendByte(0);
  bufferArray.appendByte(digest.length);
  bufferArray.push(digest);

  const redeemScript = bufferArray.concatBuffer();
  const redeemScriptHash = hash160(redeemScript);
  return bytesToHex(redeemScriptHash);
};

export const hashP2SH = (numSigs: number, pubKeys: Uint8Array[]): string => {
  if (numSigs > 15 || pubKeys.length > 15)
    throw Error('P2SH multisig address can only contain up to 15 public keys');

  // construct P2SH script
  const bufferArray = new BufferArray();
  // OP_n
  bufferArray.appendByte(80 + numSigs);
  // public keys prepended by their length
  pubKeys.forEach(pubKey => {
    bufferArray.appendByte(pubKey.length);
    bufferArray.push(pubKey);
  });
  // OP_m
  bufferArray.appendByte(80 + pubKeys.length);
  // OP_CHECKMULTISIG
  bufferArray.appendByte(174);

  const redeemScript = bufferArray.concatBuffer();
  const redeemScriptHash = hash160(redeemScript);
  return bytesToHex(redeemScriptHash);
};
