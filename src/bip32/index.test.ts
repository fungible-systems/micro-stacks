import { HDKeychain } from './index';
import { bytesToHex, hexToBytes } from 'micro-stacks/common';
import { mnemonicToSeed } from 'micro-stacks/bip39';
import * as bip39 from 'micro-stacks/bip39';
import * as bip32 from 'bip32';
import { privateKeyToStxAddress } from 'micro-stacks/crypto';
import BIP_32_FIXTURES from '../../tests/bip-32fixtures.json';
import { derivePrivateKey, derivePublicKey } from './utils';

const STX_DERIVATION_PATH = `m/44'/5757'/0'/0`;

const SECRET_KEY =
  'sound idle panel often situate develop unit text design antenna ' +
  'vendor screen opinion balcony share trigger accuse scatter visa uniform brass ' +
  'update opinion media';

const EXPECTED_MAINNET_ADDRESS = 'SP384CVPNDTYA0E92TKJZQTYXQHNZSWGCAG7SAPVB';

describe(HDKeychain.name, function () {
  test('toBase58', async () => {
    const rootPrivateKey = await mnemonicToSeed(SECRET_KEY);
    const bip39key = await bip39.mnemonicToSeed(SECRET_KEY);

    expect(bytesToHex(rootPrivateKey)).toEqual(bytesToHex(bip39key));

    const rootNode = await HDKeychain.fromSeed(rootPrivateKey);
    const rootNodeBip32 = bip32.fromSeed(Buffer.from(rootPrivateKey));
    if (!rootNodeBip32) throw Error('error');

    const b58 = rootNode.toBase58();
    const b58_2 = rootNodeBip32.toBase58();

    expect(b58).toEqual(b58_2);
  });

  test('fromBase64', async () => {
    const rootPrivateKey = await mnemonicToSeed(SECRET_KEY);
    const bip39key = await bip39.mnemonicToSeed(SECRET_KEY);

    expect(bytesToHex(rootPrivateKey)).toEqual(bytesToHex(bip39key));

    const rootNodeBip32 = bip32.fromSeed(Buffer.from(rootPrivateKey));
    if (!rootNodeBip32) throw Error('error');

    const b58_2 = rootNodeBip32.toBase58();

    const keychain = HDKeychain.fromBase58(b58_2);

    expect(bytesToHex(keychain.chainCode)).toEqual(bytesToHex(rootNodeBip32.chainCode));
  });

  test('fromSeed', async () => {
    const rootPrivateKey = await mnemonicToSeed(SECRET_KEY);
    const bip39key = await bip39.mnemonicToSeed(SECRET_KEY);

    expect(bytesToHex(rootPrivateKey)).toEqual(bytesToHex(bip39key));

    const rootNode = await HDKeychain.fromSeed(rootPrivateKey);
    const rootNodeBip32 = bip32.fromSeed(Buffer.from(rootPrivateKey));
    if (!rootNodeBip32) throw Error('error');

    expect(bytesToHex(rootNode.privateKey)).toEqual(rootNodeBip32.privateKey!.toString('hex'));
    expect(bytesToHex(rootNode.publicKey)).toEqual(rootNodeBip32.publicKey!.toString('hex'));
    expect(bytesToHex(rootNode.chainCode)).toEqual(rootNodeBip32.chainCode!.toString('hex'));
    expect(rootNode.parentFingerprint).toEqual(rootNodeBip32.parentFingerprint);
    expect(rootNode.fingerprint).toEqual(rootNodeBip32.fingerprint.readUInt32BE(0));
    expect(rootNode.depth).toEqual(rootNodeBip32.depth);

    const child = await rootNode.deriveChild(0);
    const child1 = rootNodeBip32.derive(0);
    expect(bytesToHex(child.publicKey)).toEqual(child1.publicKey.toString('hex'));

    const pathChild = await rootNode.deriveFromPath(STX_DERIVATION_PATH);
    const pathChild1 = rootNodeBip32.derivePath(STX_DERIVATION_PATH);
    expect(bytesToHex(pathChild.publicKey)).toEqual(pathChild1.publicKey.toString('hex'));

    const index_0 = await pathChild.deriveChild(0);
    const bip_index_0 = pathChild1.derive(0);

    expect(bytesToHex(index_0.publicKey)).toEqual(bip_index_0.publicKey.toString('hex'));

    const stx_addr = privateKeyToStxAddress(index_0.privateKey, undefined, true);
    const stx_addr_1 = privateKeyToStxAddress(
      bip_index_0.privateKey!.toString('hex'),
      undefined,
      true
    );

    expect(stx_addr).toEqual(stx_addr_1);
    expect(stx_addr).toEqual(EXPECTED_MAINNET_ADDRESS);
  });

  test('derive private key from master private key and factor', () => {
    const fixture = {
      sk: '50042f5964c94d1ccfd901a7d780d81a79acdbd7463859376d8ab706d7a29d60',
      factor: '20d9541c0ac213e693dc4181001dad78a61c09c18ee49e07ac7299269f0ee7a8',
      expected: '70dd83756f8b610363b54328d79e85931fc8e598d51cf73f19fd502d76b18508',
    };
    const actual = derivePrivateKey(hexToBytes(fixture.sk), hexToBytes(fixture.factor));
    expect(bytesToHex(actual)).toBe(fixture.expected);
  });

  test('derive public key from master public key and factor', () => {
    const fixture = {
      pk: '02e465419e2eba795a087586c045245cbb762cc775fe1c9006cbee183a514f63e6',
      factor: '23448739bdcd29856ecd04ed8dc08293f434ebd014a48f66ecde3ca014ee398e',
      expected: '02c8be278abbba41592ad2b7d31cc70f69ed3df741ec27548ac4eb2b1caf3460f7',
    };
    const actual = derivePublicKey(hexToBytes(fixture.pk), hexToBytes(fixture.factor));
    expect(bytesToHex(actual)).toBe(fixture.expected);
  });

  describe('hd keychain', () => {
    const sk = '50042f5964c94d1ccfd901a7d780d81a79acdbd7463859376d8ab706d7a29d60';
    const chainCode = '20d9541c0ac213e693dc4181001dad78a61c09c18ee49e07ac7299269f0ee7a8';
    test('init', () => {
      const keychain = new HDKeychain(hexToBytes(sk), hexToBytes(chainCode));
      expect(bytesToHex(keychain.privateKey)).toBe(sk);
      expect(bytesToHex(keychain.chainCode)).toBe(chainCode);
      expect(keychain.index).toBe(0);
      expect(keychain.depth).toBe(0);
    });

    test('derive the second hardened child', async () => {
      const keychain = new HDKeychain(hexToBytes(sk), hexToBytes(chainCode));
      const child = await keychain.deriveChild(1, true);
      expect(bytesToHex(child.privateKey)).toBe(
        '666b9474a10a9f17249fadf45d2debb7ae3344018937bc9a89fb6b54450274f6'
      );
      expect(bytesToHex(child.publicKey)).toBe(
        '023cc402755004c3402a5ca30784548d01d97385703f0f2101b9ceee2a24886237'
      );
      expect(child.fingerprint).toBe(2411857829);
      expect(child.index).toBe(2147483649);
      expect(child.depth).toBe(1);
    });

    test('derive the second normal child', async () => {
      const keychain = new HDKeychain(hexToBytes(sk), hexToBytes(chainCode));
      const child = await keychain.deriveChild(1, false);
      expect(bytesToHex(child.privateKey)).toBe(
        '113a66642c476af1540f9607d307620832e488b1ce39ab3360e5ad4655dffb46'
      );
      expect(bytesToHex(child.publicKey)).toBe(
        '0228c1521e32351327dcc27fd37c95b1a7052bcad315b08fff48935ba380b518c8'
      );
      expect(child.fingerprint).toBe(1328773167);
      expect(child.index).toBe(1);
      expect(child.depth).toBe(1);
    });

    test('derive from root path', async () => {
      const keychain = new HDKeychain(hexToBytes(sk), hexToBytes(chainCode));
      const child = await keychain.deriveFromPath('m');
      expect(child).toEqual(child);
    });

    test("derive from path m/1'/2/3", async () => {
      const keychain = new HDKeychain(hexToBytes(sk), hexToBytes(chainCode));
      const child = await keychain.deriveFromPath(`m/1'/2/3`);

      expect(Buffer.from(child.privateKey).toString('hex')).toBe(
        'e7042a908f3ec1ad12f01fbc209d714c63180f907726db2692b1347901405b0c'
      );
      expect(Buffer.from(child.publicKey).toString('hex')).toBe(
        '034aa6838267c3835ec714436eaf1962535be49e1d337e843fcb8b7cef5eddedc4'
      );
      expect(child.fingerprint).toBe(849527305);
      expect(child.index).toBe(3);
      expect(child.depth).toBe(3);
    });

    test('from public key', async () => {
      const pk = '034aa6838267c3835ec714436eaf1962535be49e1d337e843fcb8b7cef5eddedc4';
      const chainCode = '23448739bdcd29856ecd04ed8dc08293f434ebd014a48f66ecde3ca014ee398e';
      const keychain = HDKeychain.fromPublicKey(
        Buffer.from(pk, 'hex'),
        Buffer.from(chainCode, 'hex'),
        `m/1'/2/3`
      );
      const child = await keychain.deriveChild(0, false);
      expect(Buffer.from(child.privateKey).toString('hex')).toBe('');
      expect(Buffer.from(child.publicKey).toString('hex')).toBe(
        '033ab52b1ad3fe04d518891322388ee4e3f4f07be40d4c9c4cc06162781e46e1f5'
      );
      expect(child.fingerprint).toBe(3508961652);
      expect(child.index).toBe(0);
      expect(child.depth).toBe(4);
    });

    test('invalid private key should throw an error', () => {
      const sk = '50042f5964c94d1ccfd901a7d780d81a79acdbd7463859376d8ab706d7a29d6';
      const chainCode = '20d9541c0ac213e693dc4181001dad78a61c09c18ee49e07ac7299269f0ee7a8';

      expect(() => {
        new HDKeychain(Buffer.from(sk, 'hex'), Buffer.from(chainCode, 'hex'));
      }).toThrow();
    });

    test('bip32', async () => {
      const data = {
        master: {
          seed: '000102030405060708090a0b0c0d0e0f',
          wif: 'L52XzL2cMkHxqxBXRyEpnPQZGUs3uKiL3R11XbAdHigRzDozKZeW',
          publicKey: '0339a36013301597daef41fbe593a02cc513d0b55527ec2df1050e2e8ff49c85c2',
          privateKey: 'e8f32e723decf4051aefac8e2c93c9c5b214313817cdb01a1494b917c8436b35',
          chainCode: '873dff81c02f525623fd1fe5167eac3a55a049de3d314bb42ee227ffed37d508',
          base58:
            'xpub661MyMwAqRbcFtXgS5sYJABqqG9YLmC4Q1Rdap9gSE8NqtwybGhePY2gZ29ESFjqJoCu1Rupje8YtGqsefD265TMg7usUDFdp6W1EGMcet8',
          base58Priv:
            'xprv9s21ZrQH143K3QTDL4LXw2F7HEK3wJUD2nW2nRk4stbPy6cq3jPPqjiChkVvvNKmPGJxWUtg6LnF5kejMRNNU3TGtRBeJgk33yuGBxrMPHi',
          identifier: '3442193e1bb70916e914552172cd4e2dbc9df811',
          fingerprint: '3442193e',
        },
      };

      const keychain = new HDKeychain(
        hexToBytes(data.master.privateKey),
        hexToBytes(data.master.chainCode)
      );

      const child1 = {
        path: "m/0'",
        m: 0,
        hardened: true,
        wif: 'L5BmPijJjrKbiUfG4zbiFKNqkvuJ8usooJmzuD7Z8dkRoTThYnAT',
        publicKey: '035a784662a4a20a65bf6aab9ae98a6c068a81c52e4b032c0fb5400c706cfccc56',
        privateKey: 'edb2e14f9ee77d26dd93b4ecede8d16ed408ce149b6cd80b0715a2d911a0afea',
        chainCode: '47fdacbd0f1097043b78c63c20c34ef4ed9a111d980047ad16282c7ae6236141',
        base58:
          'xpub68Gmy5EdvgibQVfPdqkBBCHxA5htiqg55crXYuXoQRKfDBFA1WEjWgP6LHhwBZeNK1VTsfTFUHCdrfp1bgwQ9xv5ski8PX9rL2dZXvgGDnw',
        base58Priv:
          'xprv9uHRZZhk6KAJC1avXpDAp4MDc3sQKNxDiPvvkX8Br5ngLNv1TxvUxt4cV1rGL5hj6KCesnDYUhd7oWgT11eZG7XnxHrnYeSvkzY7d2bhkJ7',
        identifier: '5c1bd648ed23aa5fd50ba52b2457c11e9e80a6a7',
        fingerprint: '5c1bd648',
        index: 2147483648,
        depth: 1,
      };

      const child = await keychain.deriveFromPath(child1.path);
      expect(bytesToHex(child.publicKey)).toEqual(child1.publicKey);
    });
  });

  describe('all valid fixtures', () => {
    for (const valid of BIP_32_FIXTURES.valid.filter(item => item.network === 'bitcoin')) {
      for (const c of valid.children) {
        test(`${valid.master.identifier} - ${c.identifier}`, async () => {
          const master = HDKeychain.fromBase58(valid.master.base58Priv);
          const child = await master.deriveFromPath(c.path);
          expect(bytesToHex(child.publicKey)).toEqual(c.publicKey);
          expect(bytesToHex(child.privateKey)).toEqual(c.privateKey);
          expect(bytesToHex(child.chainCode)).toEqual(c.chainCode);
          expect(child.index).toEqual(c.index);
          expect(child.depth).toEqual(c.depth);
        });
      }
    }
  });

  it('works for Public -> public', async () => {
    const f = BIP_32_FIXTURES.valid[1];
    const c = f.children[0];

    const master = HDKeychain.fromBase58(f.master.base58);
    const child = await master.deriveChild(c.index);

    expect(c.base58).toEqual(child.toBase58());
  });

  it('throws on Public -> public (hardened)', async () => {
    const f = BIP_32_FIXTURES.valid[0];
    const c = f.children[0];

    const master = HDKeychain.fromBase58(f.master.base58);
    await expect(master.deriveChild(c.index, true)).rejects.toThrow();
  });

  it('throws on wrong types', async () => {
    const f = BIP_32_FIXTURES.valid[0];

    const master = HDKeychain.fromBase58(f.master.base58);

    for (const fx of BIP_32_FIXTURES.invalid.derive) {
      await expect(master.deriveChild(fx as any)).rejects.toThrow(TypeError);
    }

    for (const fx of BIP_32_FIXTURES.invalid.deriveHardened) {
      await expect(master.deriveChild(fx as any, true)).rejects.toThrow(TypeError);
    }

    for (const fx of BIP_32_FIXTURES.invalid.derivePath) {
      await expect(master.deriveFromPath(fx as any)).rejects.toThrow(TypeError);
    }

    const ZERO = Buffer.alloc(32, 0);
    const ONES = Buffer.alloc(32, 1);

    expect(() => HDKeychain.fromPrivateKey(Buffer.alloc(2), ONES)).toThrow();
    expect(() => HDKeychain.fromPrivateKey(ZERO, ONES)).toThrow();
  });
  it('works when private key has leading zeros', async () => {
    const key =
      'xprv9s21ZrQH143K3ckY9DgU79uMTJkQRLdbCCVDh81SnxTgPzLLGax6uHeBULTtaEtcAvKjXfT7ZWtHzKjTpujMkUd9dDb8msDeAfnJxrgAYhr';
    const hdkey = HDKeychain.fromBase58(key);

    expect(bytesToHex(hdkey.privateKey)).toEqual(
      '00000055378cf5fafb56c711c674143f9b0ee82ab0ba2924f19b64f5ae7cdbfd'
    );
    const child = await hdkey.deriveFromPath("m/44'/0'/0'/0/0'");
    expect(bytesToHex(child.privateKey)).toEqual(
      '3348069561d2a0fb925e74bf198762acc47dce7db27372257d2d959a9e6f8aeb'
    );
  });
});
