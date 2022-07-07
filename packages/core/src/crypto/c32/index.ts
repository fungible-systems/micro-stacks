import { bytesToHex, hexToBytes, concatByteArrays } from 'micro-stacks/common';
import { base58checkDecode, base58checkEncode } from '../base58';
import { BitcoinNetworkVersion } from '../base58/networks';
import { hashSha256 } from 'micro-stacks/crypto-sha';

export enum StacksNetworkVersion {
  mainnetP2PKH = 22, // 'P'   MainnetSingleSig
  mainnetP2SH = 20, // 'M'    MainnetMultiSig
  testnetP2PKH = 26, // 'T'   TestnetSingleSig
  testnetP2SH = 21, // 'N'    TestnetMultiSig
}

export const BITCOIN_TO_STACKS_NETWORK_VERSION: Record<number, number> = {
  [BitcoinNetworkVersion.mainnetP2PKH]: StacksNetworkVersion.mainnetP2PKH,
  [BitcoinNetworkVersion.mainnetP2SH]: StacksNetworkVersion.mainnetP2SH,
  [BitcoinNetworkVersion.testnetP2PKH]: StacksNetworkVersion.testnetP2PKH,
  [BitcoinNetworkVersion.testnetP2SH]: StacksNetworkVersion.testnetP2SH,
};

export const STACKS_TO_BITCOIN_NETWORK_VERSION: Record<number, number> = {
  [StacksNetworkVersion.mainnetP2PKH]: BitcoinNetworkVersion.mainnetP2PKH,
  [StacksNetworkVersion.mainnetP2SH]: BitcoinNetworkVersion.mainnetP2SH,
  [StacksNetworkVersion.testnetP2PKH]: BitcoinNetworkVersion.testnetP2PKH,
  [StacksNetworkVersion.testnetP2SH]: BitcoinNetworkVersion.testnetP2SH,
};

const c32 = '0123456789ABCDEFGHJKMNPQRSTVWXYZ';
const c32Lookup = new Map<string, number>();
[...c32].forEach((char, i) => c32Lookup.set(char, i));

const hex = '0123456789abcdef';
const hexLookup = new Map<string, number>();
[...hex].forEach((char, i) => hexLookup.set(char, i));

/**
 * Make a c32check address with the given version and hash160
 * The only difference between a c32check string and c32 address
 * is that the letter 'S' is pre-pended.
 * @param version - the address version number
 * @param hash160 - the hash160 to encode
 * @returns the address
 */
export function c32address(version: StacksNetworkVersion, hash160: Uint8Array): string {
  const checksum = c32checksum(version, hash160);
  const c32str = c32encode(concatByteArrays([hash160, checksum]));
  return `S${c32[version]}${c32str}`;
}

/**
 * Convert a base58check address to a c32check address.
 * Try to convert the version number if one is not given.
 * @param b58check - the base58check encoded address
 * @param version - the version number, if not inferred from the address
 * @returns the c32 address with the semantically-equivalent c32 version number
 */
export function b58ToC32(b58check: string): string {
  const addrInfo = base58checkDecode(b58check);
  const hash160 = addrInfo.hash;
  const addrVersion = addrInfo.version;
  let stacksVersion = addrVersion;
  if (BITCOIN_TO_STACKS_NETWORK_VERSION[addrVersion] !== undefined) {
    stacksVersion = BITCOIN_TO_STACKS_NETWORK_VERSION[addrVersion];
  }

  return c32address(stacksVersion, hash160);
}

/**
 * Convert a c32check address to a base58check address.
 * @param c32string - the c32check address
 * @returns the base58 address with the semantically-equivalent bitcoin version number
 */
export function c32ToB58(c32string: string): string {
  const addrInfo = c32addressDecode(c32string);
  const stacksVersion = addrInfo[0];
  const hash160 = addrInfo[1];
  let bitcoinVersion: number = stacksVersion;
  if (STACKS_TO_BITCOIN_NETWORK_VERSION[stacksVersion] !== undefined) {
    bitcoinVersion = STACKS_TO_BITCOIN_NETWORK_VERSION[stacksVersion];
  }
  return base58checkEncode(hash160, bitcoinVersion);
}

function c32encode(data: Uint8Array): string {
  const inputHex = bytesToHex(data);

  let res: string[] = [];
  let carry = 0;
  for (let i = inputHex.length - 1; i >= 0; i--) {
    if (carry < 4) {
      const currentCode = (hexLookup.get(inputHex[i]) as number) >> carry;
      let nextCode = 0;
      if (i !== 0) {
        nextCode = hexLookup.get(inputHex[i - 1]) as number;
      }
      // carry = 0, nextBits is 1, carry = 1, nextBits is 2
      const nextBits = 1 + carry;
      const nextLowBits = nextCode % (1 << nextBits) << (5 - nextBits);
      const curC32Digit = c32[currentCode + nextLowBits];
      carry = nextBits;
      res.unshift(curC32Digit);
    } else {
      carry = 0;
    }
  }

  let C32leadingZeros = 0;
  for (let i = 0; i < res.length; i++) {
    if (res[i] !== '0') {
      break;
    } else {
      C32leadingZeros++;
    }
  }

  res = res.slice(C32leadingZeros);

  const zeroPrefix = /^\u0000*/.exec(new TextDecoder().decode(data));
  const numLeadingZeroBytesInHex = zeroPrefix ? zeroPrefix[0].length : 0;

  for (let i = 0; i < numLeadingZeroBytesInHex; i++) {
    res.unshift(c32[0]);
  }

  return res.join('');
}

function c32checksum(version: number, data: Uint8Array): Uint8Array {
  const hash1 = hashSha256(concatByteArrays([Uint8Array.of(version), data]));
  const hash2 = hashSha256(hash1);
  const checksum = hash2.slice(0, 4);
  return checksum;
}

/**
 * Decode a c32 address into its version and hash160
 * @param c32addr - the c32check-encoded address
 * @returns a tuple with the version and hash160
 */
export function c32addressDecode(c32addr: string): [number, Uint8Array] {
  if (c32addr.length <= 5) {
    throw new Error('Invalid c32 address: invalid length');
  }
  if (c32addr[0] !== 'S') {
    throw new Error('Invalid c32 address: must start with "S"');
  }
  return c32checkDecode(c32addr.slice(1));
}

/**
 * Decode a c32check string back into its version and data payload.  This is
 * a lot like how base58check works in Bitcoin-land, but this algorithm uses
 * the z-base-32 alphabet instead of the base58 alphabet.  The algorithm
 * is as follows:
 * * extract the version, data, and checksum
 * * verify the checksum matches c32checksum(version + data)
 * * return data
 * @param c32data - the c32check-encoded string
 * @returns [version, data]. Throws an exception if the checksum does not match.
 */
export function c32checkDecode(c32data: string): [number, Uint8Array] {
  c32data = c32normalize(c32data);
  const data = c32decode(c32data.slice(1));
  const versionChar = c32data[0];
  const version = c32Lookup.get(versionChar) as number;
  const checksum = data.slice(-4);

  const calculatedChecksum = c32checksum(version, data.slice(0, -4));
  for (let i = 0; i < checksum.length; i++) {
    if (checksum[i] !== calculatedChecksum[i]) {
      throw new Error('Invalid c32check string: checksum mismatch');
    }
  }

  return [version, data.slice(0, -4)];
}

/**
 * Normalize a c32 string
 * @param c32input - the c32-encoded input string
 * @returns the canonical representation of the c32 input string
 */
export function c32normalize(c32input: string): string {
  // must be upper-case
  // replace all O's with 0's
  // replace all I's and L's with 1's
  return c32input.toUpperCase().replace(/O/g, '0').replace(/L|I/g, '1');
}

/**
 * Decode a c32 string back into bytes.  Note that the c32 input
 * string is assumed to be big-endian (and the resulting byte array will
 * be as well).
 * @param c32input - the c32-encoded input to decode
 */
export function c32decode(c32input: string): Uint8Array {
  c32input = c32normalize(c32input);

  // must result in a c32 string
  if (!RegExp(`^[${c32}]*$`).exec(c32input)) {
    throw new Error('Not a c32-encoded string');
  }

  const zeroPrefix = RegExp(`^${c32[0]}*`).exec(c32input);
  const numLeadingZeroBytes = zeroPrefix ? zeroPrefix[0].length : 0;

  let res: string[] = [];
  let carry = 0;
  let carryBits = 0;
  for (let i = c32input.length - 1; i >= 0; i--) {
    if (carryBits === 4) {
      res.unshift(hex[carry]);
      carryBits = 0;
      carry = 0;
    }
    const currentCode = (c32Lookup.get(c32input[i]) as number) << carryBits;
    const currentValue = currentCode + carry;
    const currentHexDigit = hex[currentValue % 16];
    carryBits += 1;
    carry = currentValue >> 4;
    if (carry > 1 << carryBits) {
      throw new Error('Panic error in decoding.');
    }
    res.unshift(currentHexDigit);
  }
  // one last carry
  res.unshift(hex[carry]);

  if (res.length % 2 === 1) {
    res.unshift('0');
  }

  let hexLeadingZeros = 0;
  for (let i = 0; i < res.length; i++) {
    if (res[i] !== '0') {
      break;
    } else {
      hexLeadingZeros++;
    }
  }

  res = res.slice(hexLeadingZeros - (hexLeadingZeros % 2));

  let hexStr = res.join('');
  for (let i = 0; i < numLeadingZeroBytes; i++) {
    hexStr = `00${hexStr}`;
  }

  return hexToBytes(hexStr);
}

export function validateStacksAddress(stacksAddress: string): boolean {
  try {
    c32addressDecode(stacksAddress);
    return true;
  } catch (e) {
    return false;
  }
}
