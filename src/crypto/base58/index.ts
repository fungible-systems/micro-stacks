import { encodeB58, decodeB58 } from 'micro-stacks/common';
import { hashSha256 } from 'micro-stacks/crypto-sha';
import type { BitcoinNetworkVersion } from './networks';

// original:
// @see: https://github.com/bitcoinjs/bitcoinjs-lib/blob/master/src/address.js#L30
// Thank you @hstove :~)
export function base58checkEncode(hash: Uint8Array, version: BitcoinNetworkVersion) {
  const versionBuffer = new Uint8Array([version]);
  const data = new Uint8Array(25);
  const payload = new Uint8Array(21);

  payload[0] = version;
  payload.set(hash, 1);
  const sha1 = hashSha256(payload);
  const sha2 = hashSha256(sha1);

  const checksum = sha2.slice(0, 4);

  data.set(versionBuffer, 0);
  data.set(hash, 1);
  data.set(checksum, hash.length + 1);

  return encodeB58(data);
}

/**
 * Decode a b58 address into its version and hash160.
 */
export function base58checkDecode(address: string): { hash: Uint8Array; version: number } {
  const buffer = decodeB58(address);

  // checksum validation
  const checksum = buffer.slice(-4);
  const hash1 = hashSha256(buffer.slice(0, -4));
  const hash2 = hashSha256(hash1);
  for (let i = 0; i < 4; i++) {
    if (hash2[i] !== checksum[i]) {
      throw new Error('base58 address has invalid checksum');
    }
  }

  const prefix = buffer[0];
  const data = buffer.slice(1, -4);
  return { hash: data, version: prefix };
}
