const BN_WORD_SIZE = 26;

export function isBN(num: any) {
  return (
    num !== null &&
    typeof num === 'object' &&
    num?.constructor?.wordSize === BN_WORD_SIZE &&
    Array.isArray(num?.words)
  );
}
