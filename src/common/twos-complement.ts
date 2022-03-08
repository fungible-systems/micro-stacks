const _0n = BigInt(0);
const _1n = BigInt(1);
const _128n = BigInt(128);

export function toTwos(value: bigint) {
  // make sure its in range given the number of bits
  if (value < -(_1n << (_128n - _1n)) || value > (_1n << (_128n - _1n)) - _1n)
    throw 'Integer out of range given 128 bits to represent.';

  // if positive, return the positive value
  if (value >= _0n) return value;

  // if negative, convert to twos complement representation
  return ~((-value - _1n) | ~((_1n << _128n) - _1n));
}

export function fromTwos(value: bigint) {
  if ((value & (_1n << (_128n - _1n))) > _0n) value = value - (_1n << _128n);
  return value;
}
