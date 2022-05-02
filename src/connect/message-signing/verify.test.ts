import { bytesToHex } from 'micro-stacks/common';
import { hashSha256 } from 'micro-stacks/crypto-sha';
import { utf8ToBytes } from '@noble/hashes/utils';
import { cvToHex, uintCV } from '@stacks/transactions';
import { tupleCV } from 'micro-stacks/clarity';
import { verifySignedMessage } from './verify';

// from the wallet
const payload = {
  signature:
    '007db2f251643ff11493ae377db2581a55b5dcce11a9b79becc177dc97a2fb6932076bd197a8e3772eab317d95a1c78f60adfcbf8e1512357c3f95d6606ad7dd29',
  // seems wrong
  publicKey: '035b08fd4d14786187f51a3360864665fa437a9ad22bbdf7ae716d4599f26943a7',
};

test(verifySignedMessage.name, () => {
  const hash = bytesToHex(hashSha256(utf8ToBytes(cvToHex(tupleCV({ hello: uintCV(100) })))));
  const valid = verifySignedMessage(hash, payload.signature);
  expect(valid).toBe(true);
});
