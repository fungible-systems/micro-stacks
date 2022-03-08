import { fromTwos, hexToBigInt, toTwos } from 'micro-stacks/common';

// https://github.com/indutny/bn.js/blob/db57519421f0c47c9f68c05fa6fc12273dcca2c2/test/utils-test.js#L294
const fromTwosValues = [
  // hex, bitlength, expected
  ['00000000', 32, 0],
  ['00000001', 32, 1],
  ['7fffffff', 32, 2147483647],
  ['80000000', 32, -2147483648],
  ['f0000000', 32, -268435456],
  ['f1234567', 32, -249346713],
  ['ffffffff', 32, -1],
  ['fffffffe', 32, -2],
  ['fffffffffffffffffffffffffffffffe', 128, -2],
  ['fffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffe', 256, -2],
  ['ffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff', 256, -1],
  [
    '7fffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff',
    256,
    '57896044618658097711785492504343953926634992332820282019728792003956564819967',
  ],
  [
    '8000000000000000000000000000000000000000000000000000000000000000',
    256,
    '-57896044618658097711785492504343953926634992332820282019728792003956564819968',
  ],
];

describe('.fromTwos', function () {
  it("should convert from two's complement to negative number", function () {
    for (const value of fromTwosValues) {
      const [hex, bitlength, expected] = value;
      const v = BigInt(`0x${hex}`);
      const result = fromTwos(v, bitlength).toString();
      expect(result).toEqual(expected.toString());
    }
  });
});

// https://github.com/indutny/bn.js/blob/db57519421f0c47c9f68c05fa6fc12273dcca2c2/test/utils-test.js#L323
const toTwosValues = [
  [0, 32, '0'],
  [1, 32, '1'],
  [2147483647, 32, '7fffffff'],
  ['-2147483648', 32, '80000000'],
  ['-268435456', 32, 'f0000000'],
  ['-249346713', 32, 'f1234567'],
  ['-1', 32, 'ffffffff'],
  ['-2', 32, 'fffffffe'],
  ['-2', 128, 'fffffffffffffffffffffffffffffffe'],
  ['-2', 256, 'fffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffe'],
  ['-1', 256, 'ffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff'],
];

describe('.toTwos', function () {
  it("should convert from negative number to two's complement", function () {
    for (const value of toTwosValues) {
      const [numberVal, bitlength, expected] = value;
      // due to differences in hex string functions
      // this is easier
      const expectedAsBigIntString = hexToBigInt(expected as string).toString();

      const v = BigInt(numberVal);
      const result = toTwos(v, bitlength).toString();
      expect(result).toEqual(expectedAsBigIntString);
    }
  });
});
