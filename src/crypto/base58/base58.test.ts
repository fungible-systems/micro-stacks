import { privateKeyToBase58Address, publicKeyToBase58Address } from './addresses';
import { base58checkDecode, base58checkEncode } from './index';
import { sampleAddresses } from '../../../tests/mocks/sample-addresses';

const publicKey = '029eabdfa0902bb7fd449a9c244fea5920986c0cb3f6bddf5a04c15ca60d1df255';
const privateKey = '172e1ca4745a8021c7049f51c1cbd1edc3c4345e30822dbb2ad36a9d0d3a6912';
const base58Addr = '1HLFQqHeJSoGKpw2hjUTFhyLD6dDCTVUe1';

describe('base58 addrs', () => {
  test(publicKeyToBase58Address.name, () => {
    const addr = publicKeyToBase58Address(publicKey);
    expect(addr).toEqual(base58Addr);
  });

  test(privateKeyToBase58Address.name, () => {
    const addr = privateKeyToBase58Address(privateKey);
    expect(addr).toEqual(base58Addr);
  });

  test('b58 checked decode', () => {
    for (const [btcNetworkVersion, btcAddrs] of sampleAddresses) {
      for (const addr of btcAddrs) {
        const decoded = base58checkDecode(addr);
        expect(decoded.version).toBe(btcNetworkVersion);
        const reEncoded = base58checkEncode(decoded.hash, decoded.version);
        expect(reEncoded).toBe(addr);
      }
    }
  });
});
