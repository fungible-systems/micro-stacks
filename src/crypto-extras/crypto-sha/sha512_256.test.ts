import { asciiToBytes, bytesToHex, utf8ToBytes } from 'micro-stacks/common';
import { Sha512_256 } from './sha512_256';

// https://csrc.nist.gov/CSRC/media/Projects/Cryptographic-Standards-and-Guidelines/documents/examples/SHA512_224.pdf
const TEST_CASES: [string, Uint8Array][] = [
  ['53048e2681941ef99b2e29b76b4c7dabe4c2d0c634fc6d46e0e2f13107e7af23', utf8ToBytes('abc')],
  [
    '3928e184fb8690f840da3988121d31be65cb9d3ef83ee6146feac861e19b563a',
    utf8ToBytes(
      'abcdefghbcdefghicdefghijdefghijkefghijklfghijklmghijklmnhijklmnoijklmnopjklmnopqklmnopqrlmnopqrsmnopqrstnopqrstu'
    ),
  ],
];

const test_cases: Record<string, Record<string, string | Uint8Array>> = {
  ascii: {
    c672b8d1ef56ed28ab87c3622c5114069bdd3ad7b8f9737498d0c01ecef0967a: '',
    dd9d67b371519c339ed8dbd25af90e976a1eeefd4ad3d889005e532fc5bef04d:
      'The quick brown fox jumps over the lazy dog',
    '1546741840f8a492b959d9b8b2344b9b0eb51b004bba35c0aebaac86d45264c3':
      'The quick brown fox jumps over the lazy dog.',
  },
  'ascii more than 64 bytes': {
    '21e2e940930b23f1de6377086d07e22033c6bbf3fd9fbf4b62ec66e6c08c25be':
      'The MD5 message-digest algorithm is a widely used cryptographic hash function producing a 128-bit (16-byte) hash value, typically expressed in text format as a 32 digit hexadecimal number. MD5 has been utilized in a wide variety of cryptographic applications, and is also commonly used to verify data integrity.',
  },
  UTF8: {
    b6dab29c16ec35ab34a5d92ff135b58de96741dda78b1009a2181cf8b45d2f72: '中文',
    '122802ca08e39c2ef46f6a81379dc5683bd8aa074dfb54259f0add4d8b5504bc': 'aécio',
    '1032308151c0f4f5f8d4e0d96956352eb8ff87da98df8878d8795a858a7e7c08': '𠜎',
  },
  'UTF8 more than 64 bytes': {
    d32a41d9858e45b68402f77cf9f3c3f992c36a4bffd230f78d666c87f97eaf7e:
      '訊息摘要演算法第五版（英語：Message-Digest Algorithm 5，縮寫為MD5），是當前電腦領域用於確保資訊傳輸完整一致而廣泛使用的雜湊演算法之一',
    bd1abad59e6b8ad69bc17b6e05aa13f0cb725467fbeb45b83d3e4094332d1367:
      '訊息摘要演算法第五版（英語：Message-Digest Algorithm 5，縮寫為MD5），是當前電腦領域用於確保資訊傳輸完整一致而廣泛使用的雜湊演算法之一（又譯雜湊演算法、摘要演算法等），主流程式語言普遍已有MD5的實作。',
  },
  'special length': {
    b8bd1d6cae9992f8619904683d54cbed560ec3ef2a33d8bc225175ec27dc09a4:
      '012345678012345678012345678012345678012345678012345678012345012345678012345678012345678012345678012345678012345',
    '4edb8bb93b959f482ce2e434585f3e164f53b00c42c4c46797445b39d225cfe3':
      '0123456780123456780123456780123456780123456780123456780123450123456780123456780123456780123456780123456780123456',
    '44da7ca023996ec4b4ded88410e4acc209ca26c34dc0f26550d28503974fe2d1':
      '123456781234567812345678123456781234567812345678123456781234567812345678123456781234567812345678123456781234567812345678123456781234567812345678123456781234567812345678123456781234567812345678123456781234567812345678123456781234567812345678123456781234567',
    '465859c0edc706a2a9c39d3175a715fdf6b764ccc43d45b5668c56f6d8aa9b9e':
      '1234567812345678123456781234567812345678123456781234567812345678123456781234567812345678123456781234567812345678123456781234567812345678123456781234567812345678123456781234567812345678123456781234567812345678123456781234567812345678123456781234567812345678',
  },
  Array: {
    c672b8d1ef56ed28ab87c3622c5114069bdd3ad7b8f9737498d0c01ecef0967a: Uint8Array.from([]),
    dd9d67b371519c339ed8dbd25af90e976a1eeefd4ad3d889005e532fc5bef04d: Uint8Array.from([
      84, 104, 101, 32, 113, 117, 105, 99, 107, 32, 98, 114, 111, 119, 110, 32, 102, 111, 120, 32,
      106, 117, 109, 112, 115, 32, 111, 118, 101, 114, 32, 116, 104, 101, 32, 108, 97, 122, 121, 32,
      100, 111, 103,
    ]),
  },
};

describe(Sha512_256.name, () => {
  Object.keys(test_cases).forEach(key => {
    test(key, () => {
      const getByteConverter = () => {
        switch (key) {
          case 'ascii':
          case 'ascii more than 64 bytes':
            return asciiToBytes;
          default:
            return utf8ToBytes;
        }
      };
      const bytesToX = getByteConverter();
      const entries = Object.entries(test_cases[key]);
      entries.forEach(([hash, value]) => {
        const bytes = new Sha512_256()
          .update(value instanceof Uint8Array ? value : bytesToX(value))
          .digest();
        expect(bytesToHex(bytes)).toEqual(hash);
      });
    });
  });
});

test('SHA-512/256', () => {
  for (let i = 0; i < TEST_CASES.length; i++) {
    const result = new Sha512_256().update(TEST_CASES[i][1]).digest();
    const hex = bytesToHex(result);
    expect(hex).toEqual(TEST_CASES[i][0]);
  }
});
