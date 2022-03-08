const _0n = BigInt(0);
const _1n = BigInt(1);

export function toTwos(value: bigint, bitlength: string | number = 128) {
  // make sure its in range given the number of bits
  if (
    value < -(_1n << (BigInt(bitlength) - _1n)) ||
    value > (_1n << (BigInt(bitlength) - _1n)) - _1n
  )
    throw `Integer out of range given ${bitlength} bits to represent.`;

  // if positive, return the positive value
  if (value >= _0n) return value;

  // if negative, convert to twos complement representation
  return ~((-value - _1n) | ~((_1n << BigInt(bitlength)) - _1n));
}

export function fromTwos(value: bigint, bitlength: string | number = 128) {
  if ((value & (_1n << (BigInt(bitlength) - _1n))) > _0n)
    value = value - (_1n << BigInt(bitlength));
  return value;
}
