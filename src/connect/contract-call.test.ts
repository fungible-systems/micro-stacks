import { makeContractCallToken } from './tx/contract-call';
import * as noble from 'noble-secp256k1';
import { bytesToHex, utf8ToBytes } from 'micro-stacks/common';
import { bufferCV, uintCV } from 'micro-stacks/clarity';
import { hashRipemd160 } from 'micro-stacks/crypto';
import { hashSha256 } from 'micro-stacks/crypto-sha';

describe('Make contract call token', () => {
  test('Token', async () => {
    const privateKey = bytesToHex(noble.utils.randomPrivateKey());
    const publicKey = noble.getPublicKey(privateKey, true);
    const salt = 'asdadasdasda';
    const fqn = 'thomas.stacking';
    const sha256 = hashSha256(utf8ToBytes(`${fqn}${salt}`));
    const hash160 = hashRipemd160(sha256);
    const token = await makeContractCallToken({
      privateKey,
      functionName: 'name-preorder',
      contractAddress: 'SP000000000000000000002Q6VF78',
      contractName: 'bns',
      functionArgs: [bufferCV(hash160), uintCV(200000)],
    });
    expect(token).toBeTruthy();
  });
});
