import { hmacSha512 } from './hmac-sha512';
import { bytesToHex, utf8ToBytes } from 'micro-stacks/common';
import { Hmac } from './hmac-shim';
import { Sha512 } from 'micro-stacks/crypto-sha';

// test vectors from
// http://en.wikipedia.org/wiki/Hash-based_message_authentication_code
const testVectors = [
  {
    key: '',
    data: '',
    hmac: 'b936cee86c9f87aa5d3c6f2e84cb5a4239a5fe50480a6ec66b70ab5b1f4ac6730c6c515421b327ec1d69402e53dfb49ad7381eb067b338fd7b0cb22247225d47',
  },
  {
    key: 'key',
    data: 'The quick brown fox jumps over the lazy dog',
    hmac: 'b42af09057bac1e2d41708e48a902e09b5ff7f12ab428a4fe86653c73dd248fb82f948a549f7b791a5b41915ee4d1ec3935357e4e2317250d0372afa2ebeeb3a',
  },
  // Test key > block size
  // These vectors are from https://quickhash.com/
  {
    key: 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789',
    data: 'The quick brown fox jumps over the lazy dog',
    hmac: '3135e1514cd8f6b471feb6980eedd1858047dd0c1fd44b135fade32d053b9a649f6c448fb81a6f0dc77f28f7d2505cd475aea018f90ff6961bd775acf3b8daad',
  },
  {
    key: 'test',
    data: 'test',
    hmac: '9ba1f63365a6caf66e46348f43cdef956015bea997adeb06e69007ee3ff517df10fc5eb860da3d43b82c2a040c931119d2dfc6d08e253742293a868cc2d82015',
  },
];

it('should compute a HMAC (SHA-512)', async () => {
  for (const tv of testVectors) {
    const key = utf8ToBytes(tv.key);
    const data = utf8ToBytes(tv.data);
    const result = await hmacSha512(key, data);
    expect(bytesToHex(result)).toBe(tv.hmac);
  }
});

it('should compute a HMAC (SHA-512) js-shim', () => {
  for (const tv of testVectors) {
    const key = utf8ToBytes(tv.key);
    const data = utf8ToBytes(tv.data);
    const result = new Hmac(new Sha512()).init(key).update(data).digest();
    expect(bytesToHex(result)).toBe(tv.hmac);
  }
});
