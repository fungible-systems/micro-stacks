import { StacksTransaction } from '../transaction';
import {
  createStacksPrivateKey,
  getPublicKeyFromStacksPrivateKey,
  pubKeyfromPrivKey,
  publicKeyFromBuffer,
  publicKeyToString,
} from '../keys';
import { bytesToHex, hexToBytes, omit, TransactionVersion } from 'micro-stacks/common';
import { TransactionSigner } from '../signer';
import { StacksMainnet } from 'micro-stacks/network';
import { AddressHashMode, PostConditionMode } from '../common/constants';
import { PostCondition } from '../postcondition';
import { createTokenTransferPayload } from '../payload';
import {
  createMultiSigSpendingCondition,
  createSingleSigSpendingCondition,
  createSponsoredAuth,
  createStandardAuth,
} from '../authorization';
import { createLPList } from '../types';
import { c32address, StacksNetworkVersion } from 'micro-stacks/crypto';
import {
  SignedMultiSigTokenTransferOptions,
  SignedTokenTransferOptions,
  UnsignedMultiSigTokenTransferOptions,
  UnsignedTokenTransferOptions,
} from './types';
import { getNonce } from '../fetchers/get-nonce';
import { estimateTransfer } from '../fetchers/estimate-stx-transfer';

/**
 * Generates an unsigned Stacks token transfer transaction
 *
 * Returns a Stacks token transfer transaction.
 *
 * @param  {UnsignedTokenTransferOptions | UnsignedMultiSigTokenTransferOptions} txOptions - an options object for the token transfer
 *
 * @return {Promise<StacksTransaction>}
 */
export async function makeUnsignedSTXTokenTransfer(
  txOptions: UnsignedTokenTransferOptions | UnsignedMultiSigTokenTransferOptions,
  sync?: boolean
): Promise<StacksTransaction> {
  const defaultOptions = {
    fee: BigInt(0),
    nonce: BigInt(0),
    network: new StacksMainnet(),
    postConditionMode: PostConditionMode.Deny,
    memo: '',
    sponsored: false,
  };

  const options = Object.assign(defaultOptions, txOptions);

  const payload = createTokenTransferPayload(options.recipient, options.amount, options.memo);

  let authorization = null;
  let spendingCondition = null;

  if ('publicKey' in options) {
    // single-sig
    spendingCondition = createSingleSigSpendingCondition(
      AddressHashMode.SerializeP2PKH,
      options.publicKey,
      options.nonce,
      options.fee
    );
  } else {
    // multi-sig
    spendingCondition = createMultiSigSpendingCondition(
      AddressHashMode.SerializeP2SH,
      options.numSignatures,
      options.publicKeys,
      options.nonce,
      options.fee
    );
  }

  if (options.sponsored) {
    authorization = createSponsoredAuth(spendingCondition);
  } else {
    authorization = createStandardAuth(spendingCondition);
  }

  const postConditions: PostCondition[] = [];
  if (options.postConditions && options.postConditions.length > 0) {
    options.postConditions.forEach(postCondition => {
      postConditions.push(postCondition);
    });
  }

  const lpPostConditions = createLPList(postConditions);
  const transaction = new StacksTransaction(
    options.network.version,
    authorization,
    payload,
    lpPostConditions,
    options.postConditionMode,
    options.anchorMode,
    options.network.chainId
  );

  if (sync) {
    transaction.setFee(0);
    transaction.setNonce(0);
  } else {
    if (txOptions.fee === undefined || txOptions.fee === null) {
      const txFee = await estimateTransfer(transaction, options.network);
      transaction.setFee(txFee);
    }

    if (txOptions.nonce === undefined || txOptions.nonce === null) {
      const addressVersion =
        options.network.version === TransactionVersion.Mainnet
          ? StacksNetworkVersion.mainnetP2PKH
          : StacksNetworkVersion.testnetP2PKH;
      const senderAddress = c32address(
        addressVersion,
        hexToBytes(transaction.auth.spendingCondition!.signer)
      );
      const txNonce = await getNonce(senderAddress, options.network);
      transaction.setNonce(txNonce);
    }
  }

  return transaction;
}

/**
 * Generates a signed Stacks token transfer transaction
 *
 * Returns a signed Stacks token transfer transaction.
 *
 * @param  {SignedTokenTransferOptions | SignedMultiSigTokenTransferOptions} txOptions - an options object for the token transfer
 *
 * @return {StacksTransaction}
 */
export async function makeSTXTokenTransfer(
  txOptions: SignedTokenTransferOptions | SignedMultiSigTokenTransferOptions
): Promise<StacksTransaction> {
  if ('senderKey' in txOptions) {
    const privKey = createStacksPrivateKey(txOptions.senderKey);

    const publicKey = publicKeyToString(getPublicKeyFromStacksPrivateKey(privKey));
    const options = omit(txOptions, 'senderKey');
    const transaction = await makeUnsignedSTXTokenTransfer({ publicKey, ...options });

    const signer = new TransactionSigner(transaction);
    await signer.signOrigin(privKey);

    return transaction;
  } else {
    const options = omit(txOptions, 'signerKeys');
    const transaction = await makeUnsignedSTXTokenTransfer(options);

    const signer = new TransactionSigner(transaction);
    let pubKeys = txOptions.publicKeys;
    for (const key of txOptions.signerKeys) {
      const pubKey = pubKeyfromPrivKey(key);
      pubKeys = pubKeys.filter(pk => pk !== bytesToHex(pubKey.data));
      await signer.signOrigin(createStacksPrivateKey(key));
    }

    for (const key of pubKeys) {
      signer.appendOrigin(publicKeyFromBuffer(hexToBytes(key)));
    }

    return transaction;
  }
}
