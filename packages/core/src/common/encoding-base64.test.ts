import { base64ToBytes } from 'micro-stacks/common';

test('decode url-safe style base64 strings', function () {
  const expected = [0xff, 0xff, 0xbe, 0xff, 0xef, 0xbf, 0xfb, 0xef, 0xff];

  let str = '//++/++/++//';
  let actual = base64ToBytes(str);
  for (let i = 0; i < actual.length; i++) {
    expect(actual[i]).toEqual(expected[i]);
  }

  expect(actual.byteLength).toEqual(expected.length);

  str = '__--_--_--__';
  actual = base64ToBytes(str);
  for (let i = 0; i < actual.length; i++) {
    expect(actual[i]).toEqual(expected[i]);
  }

  expect(actual.byteLength).toEqual(expected.length);
});

test('padding bytes found inside base64 string', function () {
  // See https://github.com/beatgammit/base64-js/issues/42
  const str = 'SQ==QU0=';
  expect(base64ToBytes(str)).toStrictEqual(new Uint8Array([73]));
  expect(base64ToBytes(str).byteLength).toEqual(1);
});
