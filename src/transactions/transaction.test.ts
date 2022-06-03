import { StacksTransaction, deserializeTransaction } from './transaction';

import {
  StandardAuthorization,
  createSingleSigSpendingCondition,
  SingleSigSpendingCondition,
  createMultiSigSpendingCondition,
  MultiSigSpendingCondition,
  SponsoredAuthorization,
  createStandardAuth,
  createSponsoredAuth,
} from './authorization';

import { createTokenTransferPayload, TokenTransferPayload } from './payload';

import { STXPostCondition, createSTXPostCondition } from './postcondition';

import { createLPList, createStandardPrincipal } from './types';

import {
  AnchorMode,
  PostConditionMode,
  AuthType,
  FungibleConditionCode,
  AddressHashMode,
} from './common/constants';

import { createStacksPrivateKey, pubKeyfromPrivKey, publicKeyToString } from './keys';

import { TransactionSigner } from './signer';

import { standardPrincipalCV } from 'micro-stacks/clarity';
import {
  BufferReader,
  bytesToHex,
  DEFAULT_CHAIN_ID,
  TransactionVersion,
} from 'micro-stacks/common';

describe('Single sig STX Token', function () {
  test('STX token transfer transaction serialization and deserialization', async () => {
    const transactionVersion = TransactionVersion.Testnet;
    const chainId = DEFAULT_CHAIN_ID;

    const anchorMode = AnchorMode.Any;
    const postConditionMode = PostConditionMode.Deny;

    const address = 'SP3FGQ8Z7JY9BWYZ5WM53E0M9NK7WHJF0691NZ159';
    const recipient = createStandardPrincipal(address);
    const recipientCV = standardPrincipalCV(address);
    const amount = 2500000;
    const memo = 'memo (not included';

    const payload = createTokenTransferPayload(recipientCV, amount, memo);

    const addressHashMode = AddressHashMode.SerializeP2PKH;
    const nonce = 0;
    const fee = 0;
    const pubKey = '03ef788b3830c00abe8f64f62dc32fc863bc0b2cafeb073b6c8e1c7657d9c2c3ab';
    const secretKey = 'edf9aee84d9b7abc145504dde6726c64f369d37ee34ded868fabd876c26570bc01';
    const spendingCondition = createSingleSigSpendingCondition(addressHashMode, pubKey, nonce, fee);
    const authType = AuthType.Standard;
    const authorization = createStandardAuth(spendingCondition);

    const postCondition = createSTXPostCondition(recipient, FungibleConditionCode.GreaterEqual, 0);

    const postConditions = createLPList([postCondition]);
    const transaction = new StacksTransaction(
      transactionVersion,
      authorization,
      payload,
      postConditions
    );

    const signer = new TransactionSigner(transaction);
    await signer.signOrigin(createStacksPrivateKey(secretKey));

    transaction.verifyOrigin();

    const serialized = transaction.serialize();
    const deserialized = deserializeTransaction(new BufferReader(serialized));

    const serializedHexString = bytesToHex(serialized);
    expect(bytesToHex(deserializeTransaction(serializedHexString).serialize())).toEqual(
      bytesToHex(serialized)
    );

    const serializedHexStringPrefixed = '0x' + serializedHexString;
    expect(bytesToHex(deserializeTransaction(serializedHexStringPrefixed).serialize())).toEqual(
      bytesToHex(serialized)
    );

    expect(deserialized).toEqual(transaction);

    expect(deserialized.version).toBe(transactionVersion);
    expect(deserialized.chainId).toBe(chainId);
    expect(deserialized.auth.authType).toBe(authType);
    expect((deserialized.auth.spendingCondition! as SingleSigSpendingCondition).hashMode).toBe(
      addressHashMode
    );
    expect(deserialized.auth.spendingCondition!.nonce!.toString()).toBe(nonce.toString());
    expect(deserialized.auth.spendingCondition!.fee!.toString()).toBe(fee.toString());
    expect(deserialized.anchorMode).toBe(anchorMode);
    expect(deserialized.postConditionMode).toBe(postConditionMode);
    expect(deserialized.postConditions.values.length).toBe(1);

    const deserializedPostCondition = deserialized.postConditions.values[0] as STXPostCondition;
    expect(deserializedPostCondition.principal.address).toStrictEqual(recipient.address);
    expect(deserializedPostCondition.conditionCode).toBe(FungibleConditionCode.GreaterEqual);
    expect(deserializedPostCondition.amount.toString()).toBe('0');

    const deserializedPayload = deserialized.payload as TokenTransferPayload;
    expect(deserializedPayload.recipient).toEqual(recipientCV);
    expect(deserializedPayload.amount.toString()).toBe(amount.toString());
  });

  test('STX token transfer transaction fee setting', async () => {
    const transactionVersion = TransactionVersion.Testnet;
    const chainId = DEFAULT_CHAIN_ID;

    const anchorMode = AnchorMode.Any;
    const postConditionMode = PostConditionMode.Deny;

    const address = 'SP3FGQ8Z7JY9BWYZ5WM53E0M9NK7WHJF0691NZ159';
    const recipient = createStandardPrincipal(address);
    const recipientCV = standardPrincipalCV(address);
    const amount = 2500000;
    const memo = 'memo (not included';

    const payload = createTokenTransferPayload(recipientCV, amount, memo);

    const addressHashMode = AddressHashMode.SerializeP2PKH;
    const nonce = 0;
    const fee = 0;
    const pubKey = '03ef788b3830c00abe8f64f62dc32fc863bc0b2cafeb073b6c8e1c7657d9c2c3ab';
    const secretKey = 'edf9aee84d9b7abc145504dde6726c64f369d37ee34ded868fabd876c26570bc01';
    const spendingCondition = createSingleSigSpendingCondition(addressHashMode, pubKey, nonce, fee);
    const authType = AuthType.Standard;
    const authorization = createStandardAuth(spendingCondition);

    const postCondition = createSTXPostCondition(recipient, FungibleConditionCode.GreaterEqual, 0);

    const postConditions = createLPList([postCondition]);

    const transaction = new StacksTransaction(
      transactionVersion,
      authorization,
      payload,
      postConditions
    );

    const signer = new TransactionSigner(transaction);
    await signer.signOrigin(createStacksPrivateKey(secretKey));

    transaction.verifyOrigin();

    const serialized = transaction.serialize();
    const deserialized = deserializeTransaction(new BufferReader(serialized));
    expect(deserialized.auth.spendingCondition!.fee!.toString()).toBe(fee.toString());

    const setFee = 123;
    transaction.setFee(setFee);

    const postSetFeeSerialized = transaction.serialize();
    const postSetFeeDeserialized = deserializeTransaction(new BufferReader(postSetFeeSerialized));
    expect(postSetFeeDeserialized.version).toBe(transactionVersion);
    expect(postSetFeeDeserialized.chainId).toBe(chainId);
    expect(postSetFeeDeserialized.auth.authType).toBe(authType);
    expect(
      (postSetFeeDeserialized.auth.spendingCondition! as SingleSigSpendingCondition).hashMode
    ).toBe(addressHashMode);
    expect(postSetFeeDeserialized.auth.spendingCondition!.nonce!.toString()).toBe(nonce.toString());
    expect(postSetFeeDeserialized.auth.spendingCondition!.fee!.toString()).toBe(setFee.toString());
    expect(postSetFeeDeserialized.anchorMode).toBe(anchorMode);
    expect(postSetFeeDeserialized.postConditionMode).toBe(postConditionMode);
    expect(postSetFeeDeserialized.postConditions.values.length).toBe(1);

    const deserializedPostCondition = postSetFeeDeserialized.postConditions
      .values[0] as STXPostCondition;
    expect(deserializedPostCondition.principal.address).toStrictEqual(recipient.address);
    expect(deserializedPostCondition.conditionCode).toBe(FungibleConditionCode.GreaterEqual);
    expect(deserializedPostCondition.amount.toString()).toBe('0');

    const deserializedPayload = postSetFeeDeserialized.payload as TokenTransferPayload;
    expect(deserializedPayload.recipient).toEqual(recipientCV);
    expect(deserializedPayload.amount.toString()).toBe(amount.toString());
  });
});

describe('Multi sig STX Token', function () {
  test('STX token transfer transaction multi-sig serialization and deserialization', async () => {
    const addressHashMode = AddressHashMode.SerializeP2SH;
    const nonce = 0;
    const fee = 0;

    const privKeyStrings = [
      '6d430bb91222408e7706c9001cfaeb91b08c2be6d5ac95779ab52c6b431950e001',
      '2a584d899fed1d24e26b524f202763c8ab30260167429f157f1c119f550fa6af01',
      'd5200dee706ee53ae98a03fba6cf4fdcc5084c30cfa9e1b3462dcdeaa3e0f1d201',
    ];
    const privKeys = privKeyStrings.map(createStacksPrivateKey);

    const pubKeys = privKeyStrings.map(pubKeyfromPrivKey);
    const pubKeyStrings = pubKeys.map(publicKeyToString);

    const spendingCondition = createMultiSigSpendingCondition(
      addressHashMode,
      2,
      pubKeyStrings,
      nonce,
      fee
    );
    const authType = AuthType.Standard;
    const originAuth = createStandardAuth(spendingCondition);

    const originAddress = originAuth.spendingCondition?.signer;

    expect(originAddress).toEqual('a23ea89d6529ac48ac766f720e480beec7f19273');

    const transactionVersion = TransactionVersion.Mainnet;
    const chainId = DEFAULT_CHAIN_ID;

    const anchorMode = AnchorMode.Any;

    const address = 'SP3FGQ8Z7JY9BWYZ5WM53E0M9NK7WHJF0691NZ159';
    const recipientCV = standardPrincipalCV(address);
    const amount = 2500000;

    const memo = 'memo';

    const payload = createTokenTransferPayload(recipientCV, amount, memo);

    const transaction = new StacksTransaction(transactionVersion, originAuth, payload);

    const signer = new TransactionSigner(transaction);
    await signer.signOrigin(privKeys[0]);
    await signer.signOrigin(privKeys[1]);
    signer.appendOrigin(pubKeys[2]);

    transaction.verifyOrigin();

    const serialized = transaction.serialize();
    const deserialized = deserializeTransaction(new BufferReader(serialized));
    expect(deserialized.version).toBe(transactionVersion);
    expect(deserialized.chainId).toBe(chainId);
    expect(deserialized.auth.authType).toBe(authType);
    expect((deserialized.auth.spendingCondition! as MultiSigSpendingCondition).hashMode).toBe(
      addressHashMode
    );
    expect(deserialized.auth.spendingCondition!.nonce!.toString()).toBe(nonce.toString());
    expect(deserialized.auth.spendingCondition!.fee!.toString()).toBe(fee.toString());
    expect(deserialized.anchorMode).toBe(anchorMode);
    expect(deserialized.postConditionMode).toBe(PostConditionMode.Deny);
    expect(deserialized.postConditions.values.length).toBe(0);

    const deserializedPayload = deserialized.payload as TokenTransferPayload;
    expect(deserializedPayload.recipient).toEqual(recipientCV);
    expect(deserializedPayload.amount.toString()).toBe(amount.toString());
  });

  test('STX token transfer transaction multi-sig uncompressed keys serialization and deserialization', async () => {
    const addressHashMode = AddressHashMode.SerializeP2SH;
    const nonce = 0;
    const fee = 0;

    const privKeyStrings = [
      '6d430bb91222408e7706c9001cfaeb91b08c2be6d5ac95779ab52c6b431950e0',
      '2a584d899fed1d24e26b524f202763c8ab30260167429f157f1c119f550fa6af',
      'd5200dee706ee53ae98a03fba6cf4fdcc5084c30cfa9e1b3462dcdeaa3e0f1d2',
    ];
    const privKeys = privKeyStrings.map(createStacksPrivateKey);

    const pubKeys = privKeyStrings.map(pubKeyfromPrivKey);
    const pubKeyStrings = pubKeys.map(publicKeyToString);

    const spendingCondition = createMultiSigSpendingCondition(
      addressHashMode,
      2,
      pubKeyStrings,
      nonce,
      fee
    );

    const originAuth = createStandardAuth(spendingCondition);

    const originAddress = originAuth.spendingCondition?.signer;

    expect(originAddress).toEqual('73a8b4a751a678fe83e9d35ce301371bb3d397f7');

    const transactionVersion = TransactionVersion.Mainnet;

    const address = 'SP3FGQ8Z7JY9BWYZ5WM53E0M9NK7WHJF0691NZ159';
    const recipientCV = standardPrincipalCV(address);
    const amount = 2500000;

    const memo = 'memo';

    const payload = createTokenTransferPayload(recipientCV, amount, memo);

    const transaction = new StacksTransaction(transactionVersion, originAuth, payload);

    const signer = new TransactionSigner(transaction);
    await signer.signOrigin(privKeys[0]);
    await signer.signOrigin(privKeys[1]);
    signer.appendOrigin(pubKeys[2]);

    expect(() => transaction.verifyOrigin()).not.toThrow();

    const serialized = transaction.serialize();

    // serialized tx that has been successfully deserialized and had
    // its auth verified via the stacks-blockchain implementation
    const verifiedTx =
      '0000000001040173a8b4a751a678fe83e9d35ce301371bb3d397f7000000000000000000000000000000000000000303010359b18fbcb6d5e26efc1eae70aefdae54995e6fd4f3ec40d2ff43b2227c4def1ee6416bf3dd5c92c8150fa51717f1f2db778c02ba47b8c70c1a8ff640b4edee03017b7d76c3d1f7d449604df864e4013da5094be7276aa02cb73ec9fc8108a0bed46c7cde4d702830c1db34ef7c19e2776f59107afef39084776fc88bc78dbb96560103661ec7479330bf1ef7a4c9d1816f089666a112e72d671048e5424fc528ca51530002030200000000000516df0ba3e79792be7be5e50a370289accfc8c9e03200000000002625a06d656d6f000000000000000000000000000000000000000000000000000000000000';
    expect(bytesToHex(serialized)).toBe(verifiedTx);

    expect(() => deserializeTransaction(new BufferReader(serialized))).not.toThrow();
  });
});

describe('Sponsored transactions', function () {
  test('Sponsored STX token transfer transaction serialization and deserialization', async () => {
    const transactionVersion = TransactionVersion.Testnet;
    const chainId = DEFAULT_CHAIN_ID;

    const anchorMode = AnchorMode.Any;
    const postConditionMode = PostConditionMode.Deny;

    const address = 'SP3FGQ8Z7JY9BWYZ5WM53E0M9NK7WHJF0691NZ159';
    const recipientCV = standardPrincipalCV(address);
    const amount = 2500000;
    const memo = 'memo (not included';

    const payload = createTokenTransferPayload(recipientCV, amount, memo);

    const addressHashMode = AddressHashMode.SerializeP2PKH;
    const nonce = 0;
    const sponsorNonce = 123;
    const fee = 0;
    const pubKey = '03ef788b3830c00abe8f64f62dc32fc863bc0b2cafeb073b6c8e1c7657d9c2c3ab';
    const secretKey = 'edf9aee84d9b7abc145504dde6726c64f369d37ee34ded868fabd876c26570bc01';
    const sponsorPubKey = '02b6cfeae7cdcd7ae9229e2decc7d75fe727f8dc9f0d81e58aaf46de550d8e3f58';
    const sponsorSecretKey = '3372fdabb09819bb6c9446da8a067840c81dcf8d229d048de36caac3562c5f7301';
    const spendingCondition = createSingleSigSpendingCondition(addressHashMode, pubKey, nonce, fee);
    const sponsorSpendingCondition = createSingleSigSpendingCondition(
      addressHashMode,
      sponsorPubKey,
      sponsorNonce,
      fee
    );

    const authType = AuthType.Sponsored;
    const authorization = createSponsoredAuth(spendingCondition, sponsorSpendingCondition);

    const transaction = new StacksTransaction(transactionVersion, authorization, payload);

    const signer = new TransactionSigner(transaction);
    await signer.signOrigin(createStacksPrivateKey(secretKey));
    await signer.signSponsor(createStacksPrivateKey(sponsorSecretKey));

    transaction.verifyOrigin();

    const serialized = transaction.serialize();
    const deserialized = deserializeTransaction(new BufferReader(serialized));
    expect(deserialized.version).toBe(transactionVersion);
    expect(deserialized.chainId).toBe(chainId);
    expect(deserialized.auth.authType).toBe(authType);
    expect(deserialized.auth.spendingCondition!.hashMode).toBe(addressHashMode);
    expect(deserialized.auth.spendingCondition!.nonce!.toString()).toBe(nonce.toString());
    expect(deserialized.auth.spendingCondition!.fee!.toString()).toBe(fee.toString());
    expect((deserialized.auth as SponsoredAuthorization).sponsorSpendingCondition!.hashMode).toBe(
      addressHashMode
    );
    expect(
      (deserialized.auth as SponsoredAuthorization).sponsorSpendingCondition!.nonce!.toString()
    ).toBe(sponsorNonce.toString());
    expect(
      (deserialized.auth as SponsoredAuthorization).sponsorSpendingCondition!.fee!.toString()
    ).toBe(fee.toString());
    expect(deserialized.anchorMode).toBe(anchorMode);
    expect(deserialized.postConditionMode).toBe(postConditionMode);

    const deserializedPayload = deserialized.payload as TokenTransferPayload;
    expect(deserializedPayload.recipient).toEqual(recipientCV);
    expect(deserializedPayload.amount.toString()).toBe(amount.toString());
  });
});
