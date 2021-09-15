import { getRandomBytes } from 'micro-stacks/crypto';
import { createPbkdf2 } from 'micro-stacks/crypto-pbkdf2';
import { hashSha256 } from 'micro-stacks/crypto-sha';
import { bytesToHex, hexToBytes, utf8ToBytes } from 'micro-stacks/common';
import { WORDLIST } from './wordlist';

export const getWordList = () => {
  return WORDLIST as string[];
};

export { WORDLIST };
const INVALID_MNEMONIC = 'Invalid mnemonic';
const INVALID_ENTROPY = 'Invalid entropy';
const INVALID_CHECKSUM = 'Invalid mnemonic checksum';
const WORDLIST_REQUIRED =
  'A wordlist is required but a default could not be found.\n' +
  'Please pass a 2048 word array explicitly.';

function normalizeWords(str?: string): string {
  return (str || '').normalize('NFKD');
}

function lpad(str: string, padString: string, length: number): string {
  while (str.length < length) {
    str = padString + str;
  }
  return str;
}

export function binaryToByte(bin: string): number {
  return parseInt(bin, 2);
}

export function bytesToBinary(bytes: number[]): string {
  return bytes.map((x: number): string => lpad(x.toString(2), '0', 8)).join('');
}

export function deriveChecksumBits(entropyBuffer: Uint8Array): string {
  const ENT = entropyBuffer.length * 8;
  const CS = ENT / 32;
  const hash = hashSha256(entropyBuffer);
  return bytesToBinary(Array.from(hash)).slice(0, CS);
}

function salt(password?: string): string {
  return 'mnemonic' + (password || '');
}

export async function mnemonicToSeed(mnemonic: string, password?: string): Promise<Uint8Array> {
  const pbkdf2 = await createPbkdf2();
  return pbkdf2.derive(
    normalizeWords(mnemonic),
    utf8ToBytes(salt(normalizeWords(password))),
    2048,
    64,
    'sha512'
  );
}

function validateEntropy(entropyBytes: number[]) {
  // 128 <= ENT <= 256
  if (entropyBytes.length < 16) throw new Error(INVALID_ENTROPY);
  if (entropyBytes.length > 32) throw new Error(INVALID_ENTROPY);
  if (entropyBytes.length % 4 !== 0) throw new Error(INVALID_ENTROPY);
}

export function mnemonicToEntropy(mnemonic: string): string {
  const wordlist = getWordList();
  if (!wordlist) throw new Error(WORDLIST_REQUIRED);

  const words = normalizeWords(mnemonic).split(' ');
  if (words.length % 3 !== 0) throw new Error(INVALID_MNEMONIC);

  // convert word indices to 11 bit binary strings
  const bits = words
    .map((word: string): string => {
      const index = wordlist!.indexOf(word);
      if (index === -1) {
        throw new Error(INVALID_MNEMONIC);
      }

      return lpad(index.toString(2), '0', 11);
    })
    .join('');

  // split the binary string into ENT/CS
  const dividerIndex = Math.floor(bits.length / 33) * 32;
  const entropyBits = bits.slice(0, dividerIndex);
  const checksumBits = bits.slice(dividerIndex);

  // calculate the checksum and compare
  const entropyBytes = entropyBits.match(/(.{1,8})/g)!.map(binaryToByte);

  validateEntropy(entropyBytes);

  const entropy = Uint8Array.from(entropyBytes);
  const newChecksum = deriveChecksumBits(entropy);
  if (newChecksum !== checksumBits) throw new Error(INVALID_CHECKSUM);

  return bytesToHex(entropy);
}

export function entropyToMnemonic(entropy: Uint8Array | string): string {
  if (typeof entropy === 'string') entropy = hexToBytes(entropy);
  const wordlist = getWordList();
  if (!wordlist) throw new Error(WORDLIST_REQUIRED);
  validateEntropy(Array.from(entropy));
  const entropyBits = bytesToBinary(Array.from(entropy));
  const checksumBits = deriveChecksumBits(entropy);

  const bits = entropyBits + checksumBits;
  const chunks = bits.match(/(.{1,11})/g)!;
  const words = chunks.map((binary: string): string => {
    const index = binaryToByte(binary);
    return wordlist![index];
  });
  return words.join(' ');
}

export function generateMnemonic(
  strength?: number,
  rng: (size: number) => Uint8Array = getRandomBytes
): string {
  strength = strength || 128;
  if (strength % 32 !== 0) throw new TypeError(INVALID_ENTROPY);
  return entropyToMnemonic(rng(strength / 8));
}

export function validateMnemonic(mnemonic: string): boolean {
  try {
    mnemonicToEntropy(mnemonic);
  } catch (_e) {
    return false;
  }
  return true;
}
