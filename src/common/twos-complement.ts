export function toTwos(value: bigint) {
  // make sure its in range given the number of bits
  if (value < -(1n << (128n - 1n)) || value > (1n << (128n - 1n)) - 1n)
    throw 'Integer out of range given 128 bits to represent.';

  // if positive, return the positive value
  if (value >= 0n) return value;

  // if negative, convert to twos complement representation
  return ~((-value - 1n) | ~((1n << 128n) - 1n));
}

export function fromTwos(value: bigint) {
  if ((value & (1n << (128n - 1n))) > 0n) value = value - (1n << 128n);
  return value;
}
