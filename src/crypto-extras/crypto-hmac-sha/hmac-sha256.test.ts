import { bytesToHex, utf8ToBytes } from 'micro-stacks/common';
import { hmacSha256 } from './hmac-sha256';

// test vectors from
// http://en.wikipedia.org/wiki/Hash-based_message_authentication_code
const testVectors = [
  {
    key: '',
    data: '',
    hmac: 'b613679a0814d9ec772f95d778c35fc5ff1697c493715653c6c712144292c5ad',
  },
  {
    key: 'key',
    data: 'The quick brown fox jumps over the lazy dog',
    hmac: 'f7bc83f430538424b13298e6aa6fb143ef4d59a14946175997479dbc2d1a3cd8',
  },
  // Test key > block size
  // These vectors are from https://quickhash.com/
  {
    key: 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789',
    data: 'The quick brown fox jumps over the lazy dog',
    hmac: '359706cae34991529dbf545ed055bed283da8b7339807db6affa2ae517d8b389',
  },
];

it('should compute a HMAC (SHA-256)', () => {
  for (const tv of testVectors) {
    const key = utf8ToBytes(tv.key);
    const data = utf8ToBytes(tv.data);
    const result = hmacSha256(key, data);
    expect(bytesToHex(result)).toBe(tv.hmac);
  }
});
