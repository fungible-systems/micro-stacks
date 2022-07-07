import { cvToValue, intCV, uintCV } from 'micro-stacks/clarity';

test('Clarity integer to JSON value', () => {
  // 53 bits is max safe integer and max supported by bn.js `toNumber()`

  const maxSafeInt = 2n ** 53n - 1n;
  const unsafeLargeIntSize = maxSafeInt + 1n;
  expect(maxSafeInt.toString()).toBe(Number.MAX_SAFE_INTEGER.toString());

  const minSafeInt = -(2n ** 53n - 1n);
  const unsafeMinIntSize = minSafeInt - 1n;
  expect(minSafeInt.toString()).toBe(Number.MIN_SAFE_INTEGER.toString());

  const smallBitsUInt1 = cvToValue<string>(uintCV(maxSafeInt), true);
  expect(smallBitsUInt1.toString()).toBe(maxSafeInt.toString());
  expect(typeof smallBitsUInt1).toBe('string');

  const smallBitsInt1 = cvToValue<string>(intCV(maxSafeInt), true);
  expect(smallBitsInt1.toString()).toBe(maxSafeInt.toString());
  expect(typeof smallBitsInt1).toBe('string');

  const smallBitsInt2 = cvToValue<string>(intCV(minSafeInt), true);
  expect(smallBitsInt2.toString()).toBe(minSafeInt.toString());
  expect(typeof smallBitsInt2).toBe('string');

  const largeBitsUInt1 = cvToValue<string>(uintCV(unsafeLargeIntSize), true);
  expect(largeBitsUInt1.toString()).toBe(unsafeLargeIntSize.toString());
  expect(typeof largeBitsUInt1).toBe('string');

  const largeBitsInt1 = cvToValue<string>(intCV(unsafeLargeIntSize), true);
  expect(largeBitsInt1.toString()).toBe(unsafeLargeIntSize.toString());
  expect(typeof largeBitsInt1).toBe('string');

  const largeBitsInt2 = cvToValue<string>(intCV(unsafeMinIntSize), true);
  expect(largeBitsInt2.toString()).toBe(unsafeMinIntSize.toString());
  expect(typeof largeBitsInt2).toBe('string');
});
