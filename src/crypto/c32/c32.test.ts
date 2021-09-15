import { sampleAddresses } from '../../../tests/mocks/sample-addresses';
import { b58ToC32, c32ToB58, StacksNetworkVersion } from './index';
import * as noble from 'noble-secp256k1';
import { getPublicKeyFromPrivate } from '@stacks/encryption';
import { publicKeyToStxAddress } from 'micro-stacks/crypto';

test('b58 to c32', () => {
  for (const [btcNetwork, btcAddrs, stxNetwork, stxAddrs] of sampleAddresses) {
    for (let i = 0; i < btcAddrs.length; i++) {
      const stxToBtc = b58ToC32(btcAddrs[i]);
      expect(stxToBtc).toBe(stxAddrs[i]);

      const btcToStx = c32ToB58(stxAddrs[i]);
      expect(btcToStx).toBe(btcAddrs[i]);
    }
  }
});

test('public key to STX address', () => {
  const publicKey = '029eabdfa0902bb7fd449a9c244fea5920986c0cb3f6bddf5a04c15ca60d1df255';

  const stxAddr1 = publicKeyToStxAddress(publicKey);
  expect(stxAddr1).toBe('SP2SJBWG7W60FR02BP8QQPQ2B781V5CGPKKYTYF4Q');

  const stxAddr2 = publicKeyToStxAddress(publicKey, StacksNetworkVersion.testnetP2PKH);
  expect(stxAddr2).toBe('ST2SJBWG7W60FR02BP8QQPQ2B781V5CGPKG95CYAN');
});

test('private key to STX address', () => {
  const privateKey = 'd7c71a427b8a9ed870c9552f67beadc2710dbee7f29a0cf6cfd1dd96a703bf1801';
  const publicKey1 = getPublicKeyFromPrivate(privateKey.slice(0, 64));
  const publicKey2 = noble.getPublicKey(privateKey.slice(0, 64), true);
  const stxAddr1 = publicKeyToStxAddress(publicKey1);
  const stxAddr2 = publicKeyToStxAddress(publicKey2);

  expect(stxAddr1).toEqual(stxAddr2);
});
