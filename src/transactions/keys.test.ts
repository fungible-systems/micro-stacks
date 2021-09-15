import {
  compressPublicKey,
  createStacksPrivateKey,
  getPublicKeyFromStacksPrivateKey,
  makeRandomPrivKey,
  privateKeyToString,
  pubKeyfromPrivKey,
  publicKeyFromSignature,
  publicKeyToString,
  signWithKey,
  StacksPublicKey,
} from './keys';
import { PubKeyEncoding } from './common/constants';
import { bytesToHex, hexToBytes, utf8ToBytes } from 'micro-stacks/common';
import { serializeDeserialize } from './common/test-utils';
import {
  privateKeyToStxAddress,
  publicKeyToStxAddress,
  StacksNetworkVersion,
} from 'micro-stacks/crypto';
import { StacksMessageType } from 'micro-stacks/clarity';

test('Stacks public key and private keys', () => {
  const privKeyString = 'edf9aee84d9b7abc145504dde6726c64f369d37ee34ded868fabd876c26570bc';
  const pubKeyString =
    '04ef788b3830c00abe8f64f62dc32fc863bc0b2cafeb073b6c8e1c7657d9c2c3ab' +
    '5b435d20ea91337cdd8c30dd7427bb098a5355e9c9bfad43797899b8137237cf';
  const pubKey = pubKeyfromPrivKey(privKeyString);
  expect(publicKeyToString(pubKey)).toBe(pubKeyString);

  const deserialized = serializeDeserialize(pubKey, StacksMessageType.PublicKey) as StacksPublicKey;

  expect(publicKeyToString(deserialized)).toBe(pubKeyString);

  const privKey = createStacksPrivateKey(privKeyString);
  expect(publicKeyToString(getPublicKeyFromStacksPrivateKey(privKey))).toBe(pubKeyString);

  const randomKey = makeRandomPrivKey();
  expect(privateKeyToString(randomKey).length).toEqual(64);

  expect(privateKeyToStxAddress(privKeyString)).toBe('SPZG6BAY4JVR9RNAB1HY92B7Q208ZYY4HZEA9PX5');
  expect(privateKeyToStxAddress(hexToBytes(privKeyString))).toBe(
    'SPZG6BAY4JVR9RNAB1HY92B7Q208ZYY4HZEA9PX5'
  );

  expect(privateKeyToStxAddress(privKeyString, StacksNetworkVersion.testnetP2PKH)).toBe(
    'STZG6BAY4JVR9RNAB1HY92B7Q208ZYY4HZG8ZXFM'
  );
  expect(privateKeyToStxAddress(hexToBytes(privKeyString), StacksNetworkVersion.testnetP2PKH)).toBe(
    'STZG6BAY4JVR9RNAB1HY92B7Q208ZYY4HZG8ZXFM'
  );

  expect(publicKeyToStxAddress(pubKeyString)).toBe('SPZG6BAY4JVR9RNAB1HY92B7Q208ZYY4HZEA9PX5');
  expect(publicKeyToStxAddress(pubKeyString)).toBe('SPZG6BAY4JVR9RNAB1HY92B7Q208ZYY4HZEA9PX5');

  expect(publicKeyToStxAddress(pubKeyString, StacksNetworkVersion.testnetP2PKH)).toBe(
    'STZG6BAY4JVR9RNAB1HY92B7Q208ZYY4HZG8ZXFM'
  );
  expect(publicKeyToStxAddress(pubKeyString, StacksNetworkVersion.testnetP2PKH)).toBe(
    'STZG6BAY4JVR9RNAB1HY92B7Q208ZYY4HZG8ZXFM'
  );

  const compressedPubKey = bytesToHex(compressPublicKey(pubKey.data).data);
  expect(compressedPubKey).toBe(
    '03ef788b3830c00abe8f64f62dc32fc863bc0b2cafeb073b6c8e1c7657d9c2c3ab'
  );
});

test('Retrieve public key from signature', async () => {
  const privKey = createStacksPrivateKey(
    'edf9aee84d9b7abc145504dde6726c64f369d37ee34ded868fabd876c26570bc'
  );
  const uncompressedPubKey =
    '04ef788b3830c00abe8f64f62dc32fc863bc0b2cafeb073b6c8e1c7657d9c2c3ab5b435d20ea91337cdd8c30dd7427bb098a5355e9c9bfad43797899b8137237cf';
  const compressedPubKey = '03ef788b3830c00abe8f64f62dc32fc863bc0b2cafeb073b6c8e1c7657d9c2c3ab';

  const message = 'hello world';
  const messageHash = bytesToHex(utf8ToBytes(message));
  const sig = await signWithKey(privKey, messageHash);

  const uncompressedPubKeyFromSig = publicKeyFromSignature(
    messageHash,
    sig,
    PubKeyEncoding.Uncompressed
  );
  const compressedPubKeyFromSig = publicKeyFromSignature(
    messageHash,
    sig,
    PubKeyEncoding.Compressed
  );

  expect(uncompressedPubKeyFromSig).toBe(uncompressedPubKey);
  expect(compressedPubKeyFromSig).toBe(compressedPubKey);
});
