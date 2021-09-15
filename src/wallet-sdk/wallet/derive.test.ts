import { mnemonicToSeed } from 'micro-stacks/bip39';
import { HDKeychain } from 'micro-stacks/bip32';
import { deriveLegacyConfigPrivateKey, deriveWalletKeys } from './derive';
import { privateKeyToStxAddress } from 'micro-stacks/crypto';
import { Wallet } from '../types';
import { deriveAccount } from '../account/derive-account';

const SECRET_KEY =
  'sound idle panel often situate develop unit text design antenna ' +
  'vendor screen opinion balcony share trigger accuse scatter visa uniform brass ' +
  'update opinion media';

const TEST_WALLET: Wallet = {
  salt: 'e95b8fed404c4130267b15be0df5aecb7c118f1297bf25d096e2bf442ec7b1a7',
  rootKey:
    'xprv9s21ZrQH143K2bCXs73Bt3sfzEXzMCgRgtmDJ7R7K6cMgMFq95EvBM8DWTd7bSZthijgPrzxStburCzvQ6dxA2mmpPKGTxCi9peyPyMeJ3B',
  configPrivateKey: '3b6d03391916e05f549eb08d47f931b7c368ec4fda37d2150f160af1a8671a41',
  encryptedSecretKey:
    '5ed9074b9b35be315e4191f06354ebc91b103b662fca3623c8d99cd960d9c070d437f29329112db63de32c970c9bd2ed02afaee55b32d1dce063b1db7aa178b39b230cf5b1ec4245495f89a69a27237c',
  accounts: [
    {
      stxPrivateKey: 'cc440106121617d5ea23646552aa40a62316878293a1baa7a02fbb071b8cbe2901',
      dataPrivateKey: '504b91ea465bb9f6c28a38432869bd04dbeb85b46525bcf5e9615a9ddfcc178c',
      appsKey:
        'xprvA2KzZmgR2PMM55CgbWxRC6K74n4ANrBitjxKnKmEJYLq4tfQX5p17NpUx9gvk4fnnJDym14E1hixmDzjfbt4Fmf73g1RcvQZpMzih81Lg1S',
      salt: 'e95b8fed404c4130267b15be0df5aecb7c118f1297bf25d096e2bf442ec7b1a7',
      index: 0,
    },
    {
      stxPrivateKey: '1499c9194feed4cbca3bd9f7a2b3413684d30c1a9d8a7f044398f9e27ae5d00301',
      dataPrivateKey: 'f96a1e65ce95db1ee6ff2e53988d4a3524c433548758d95354ea05fc24cc4505',
      appsKey:
        'xprvA1eQc5DGP8KU275yPdXUbWXPW4Ba2h2poSpXnV5jxxfpPghuaP4p8R1YHg8MsmqGpwFQU4R74cU5x8E7dExQN14cvPHn6c1vxajxWjQxTpM',
      salt: 'e95b8fed404c4130267b15be0df5aecb7c118f1297bf25d096e2bf442ec7b1a7',
      index: 1,
      username: 'fdsfdsfdf.id.blockstack',
    },
    {
      stxPrivateKey: 'b8e5b2c33be621fb16a5260b30d526cadc7087d58736f2f3c6f84d31be452b6601',
      dataPrivateKey: 'bdcc48a4b8c098a7cb06e7221ee0b784c05083353dad964674a4eebfaa104f0d',
      appsKey:
        'xprvA1vvF4rkEyBDLuvQKTa9YvCNKHcTNsrBwD5imsnnatG9RiyF5634o2GBwb5YvjC237LK6k273xRmaiCsNKpbS2EXUGPTtWo3CBFKRmzEHti',
      salt: 'e95b8fed404c4130267b15be0df5aecb7c118f1297bf25d096e2bf442ec7b1a7',
      index: 2,
      username: 'thisis45678.id.blockstack',
    },
    {
      stxPrivateKey: 'da62811e06fe6fb394982a740fdcab6f1194ed85c5f6421021777638512d41ee01',
      dataPrivateKey: '522a6fb27d2255c30ab7d83ffc3b43cda4627c505619f0bb1e7de66c297bc53c',
      appsKey:
        'xprvA23n53oLHrMsQcVULk6UBg3PJUWHC3L6W8DmKqzGEVprqjSF1qs8hcZfP3H1zg1asSUDDZBXNw81p5BBALZorQz2fKNeWGfwmRhUsbMiVsH',
      salt: 'e95b8fed404c4130267b15be0df5aecb7c118f1297bf25d096e2bf442ec7b1a7',
      index: 3,
      username: 'integration_tester.test-personal.id',
    },
  ],
};

test('keys are serialized, and can be deserialized properly', async () => {
  const rootPrivateKey = await mnemonicToSeed(SECRET_KEY);
  const rootNode1 = await HDKeychain.fromSeed(rootPrivateKey);
  const derived = await deriveWalletKeys(rootNode1);
  const rootNode = HDKeychain.fromBase58(derived.rootKey);
  const account = await deriveAccount(rootNode, 0, derived.salt);
  expect(privateKeyToStxAddress(account.stxPrivateKey.slice(0, 64), undefined, true)).toEqual(
    'SP384CVPNDTYA0E92TKJZQTYXQHNZSWGCAG7SAPVB'
  );
});

test('backwards compatible legacy config private key derivation', async () => {
  const rootPrivateKey = await mnemonicToSeed(SECRET_KEY);
  const rootNode = await HDKeychain.fromSeed(rootPrivateKey);
  const legacyKey = await deriveLegacyConfigPrivateKey(rootNode.toBase58());
  expect(legacyKey).toEqual('767b51d866d068b02ce126afe3737896f4d0c486263d9b932f2822109565a3c6');
});

test('legacy', async () => {
  const rootNode = HDKeychain.fromBase58(TEST_WALLET.rootKey);
  const keys = await deriveWalletKeys(rootNode);
  expect(keys.salt).toEqual(TEST_WALLET.salt);
  expect(keys.configPrivateKey).toEqual(TEST_WALLET.configPrivateKey);
  expect(keys.rootKey).toEqual(TEST_WALLET.rootKey);
  for (const c of TEST_WALLET.accounts) {
    const childKeys = await deriveAccount(rootNode, c.index, keys.salt);
    expect(childKeys.salt).toEqual(c.salt);
    expect(childKeys.index).toEqual(c.index);
    expect(childKeys.appsKey).toEqual(c.appsKey);
    expect(childKeys.dataPrivateKey).toEqual(c.dataPrivateKey);
    expect(childKeys.stxPrivateKey).toEqual(c.stxPrivateKey);
  }
});
