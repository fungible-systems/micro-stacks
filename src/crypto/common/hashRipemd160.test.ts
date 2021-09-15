import { hashRipemd160 } from 'micro-stacks/crypto';
import { bytesToHex, utf8ToBytes } from 'micro-stacks/common';

describe(hashRipemd160.name, () => {
  test("Raw string ''", () => {
    const rawString = '';
    const expectedHash = '9c1185a5c5e9fc54612808977ee8f548b2258d31';
    const actualHash = hashRipemd160(utf8ToBytes(rawString));
    expect(bytesToHex(actualHash)).toBe(expectedHash);
  });
  test("Uint8Array string ''", () => {
    const message = new Uint8Array();
    const expectedHash = new Uint8Array([
      156, 17, 133, 165, 197, 233, 252, 84, 97, 40, 8, 151, 126, 232, 245, 72, 178, 37, 141, 49,
    ]);

    const actualHash = hashRipemd160(message);
    expect(bytesToHex(actualHash)).toEqual(bytesToHex(expectedHash));
  });
  test("Raw string 'a'", () => {
    const rawString = 'a';
    const expectedHash = '0bdc9d2d256b3ee9daae347be6f4dc835a467ffe';
    const actualHash = hashRipemd160(utf8ToBytes(rawString));
    expect(bytesToHex(actualHash)).toBe(expectedHash);
  });
  test("Uint8Array string 'a'", () => {
    const message = new Uint8Array([97]);
    const expectedHash = new Uint8Array([
      11, 220, 157, 45, 37, 107, 62, 233, 218, 174, 52, 123, 230, 244, 220, 131, 90, 70, 127, 254,
    ]);
    const actualHash = hashRipemd160(message);
    expect(bytesToHex(actualHash)).toEqual(bytesToHex(expectedHash));
  });
  test("Raw string 'abc'", () => {
    const rawString = 'abc';
    const expectedHash = '8eb208f7e05d987a9b044a8e98c6b087f15a0bfc';
    const actualHash = hashRipemd160(utf8ToBytes(rawString));
    expect(bytesToHex(actualHash)).toBe(expectedHash);
  });
  test("Uint8Array string 'abc'", () => {
    const message = new Uint8Array([97, 98, 99]);
    const expectedHash = new Uint8Array([
      142, 178, 8, 247, 224, 93, 152, 122, 155, 4, 74, 142, 152, 198, 176, 135, 241, 90, 11, 252,
    ]);
    const actualHash = hashRipemd160(message);
    expect(bytesToHex(actualHash)).toEqual(bytesToHex(expectedHash));
  });
  test("Raw string 'message digest'", () => {
    const rawString = 'message digest';
    const expectedHash = '5d0689ef49d2fae572b881b123a85ffa21595f36';
    const actualHash = hashRipemd160(utf8ToBytes(rawString));
    expect(bytesToHex(actualHash)).toBe(expectedHash);
  });
  test("Uint8Array string 'message digest'", () => {
    const message = new Uint8Array([
      109, 101, 115, 115, 97, 103, 101, 32, 100, 105, 103, 101, 115, 116,
    ]);
    const expectedHash = new Uint8Array([
      93, 6, 137, 239, 73, 210, 250, 229, 114, 184, 129, 177, 35, 168, 95, 250, 33, 89, 95, 54,
    ]);
    const actualHash = hashRipemd160(message);
    expect(bytesToHex(actualHash)).toEqual(bytesToHex(expectedHash));
  });
  test("Raw string 'abcdefghijklmnopqrstuvwxyz'", () => {
    const rawString = 'abcdefghijklmnopqrstuvwxyz';
    const expectedHash = 'f71c27109c692c1b56bbdceb5b9d2865b3708dbc';
    const actualHash = hashRipemd160(utf8ToBytes(rawString));
    expect(bytesToHex(actualHash)).toBe(expectedHash);
  });
  test("Raw string 'abcdbcdecdefdefgefghfghighi...'", () => {
    const rawString = 'abcdbcdecdefdefgefghfghighijhijkijkljklmklmnlmnomnopnopq';
    const expectedHash = '12a053384a9c0c88e405a06c27dcf49ada62eb2b';
    const actualHash = hashRipemd160(utf8ToBytes(rawString));
    expect(bytesToHex(actualHash)).toBe(expectedHash);
  });
  test("Raw string 'abcdbcdecdefdefgefghfghighi...'", () => {
    const rawString = 'abcdbcdecdefdefgefghfghighijhijkijkljklmklmnlmnomnopnopq';
    const expectedHash = '12a053384a9c0c88e405a06c27dcf49ada62eb2b';
    const actualHash = hashRipemd160(utf8ToBytes(rawString));
    expect(bytesToHex(actualHash)).toBe(expectedHash);
  });
  test("Raw string 'ABCDEFGHIJKLMNOPQRSTUVWXYZa...'", () => {
    const rawString = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    const expectedHash = 'b0e20b6e3116640286ed3a87a5713079b21f5189';
    const actualHash = hashRipemd160(utf8ToBytes(rawString));
    expect(bytesToHex(actualHash)).toBe(expectedHash);
  });
  test("Raw string '12345678901234567890123456789012345678901234567890123456789012345678901234567890'", () => {
    const rawString =
      '12345678901234567890123456789012345678901234567890123456789012345678901234567890';
    const expectedHash = '9b752e45573d4b39f4dbd3323cab82bf63326bfb';
    const actualHash = hashRipemd160(utf8ToBytes(rawString));
    expect(bytesToHex(actualHash)).toBe(expectedHash);
  });
  test("Raw string million times 'a'", () => {
    const rawString = 'a'.repeat(1000000);
    const expectedHash = '52783243c1697bdbe16d37f97f68f08325dc1528';
    const actualHash = hashRipemd160(utf8ToBytes(rawString));
    expect(bytesToHex(actualHash)).toBe(expectedHash);
  });
  test("Raw string 'The quick brown dog...'", () => {
    const rawString = 'The quick brown fox jumps over the lazy dog';
    const expectedHash = '37f332f68db77bd9d7edd4969571ad671cf9dd3b';
    const actualHash = hashRipemd160(utf8ToBytes(rawString));
    expect(bytesToHex(actualHash)).toBe(expectedHash);
  });
  test("Raw string 'The quick brown cog...'", () => {
    const rawString = 'The quick brown fox jumps over the lazy cog';
    const expectedHash = '132072df690933835eb8b6ad0b77e7b6f14acad7';
    const actualHash = hashRipemd160(utf8ToBytes(rawString));
    expect(bytesToHex(actualHash)).toBe(expectedHash);
  });
});
