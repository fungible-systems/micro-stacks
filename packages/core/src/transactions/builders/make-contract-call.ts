import { StacksTransaction } from '../transaction';
import { StacksMainnet } from 'micro-stacks/network';
import { AddressHashMode, PostConditionMode } from '../common/constants';
import { createContractCallPayload } from '../payload';
import { ClarityAbi } from 'micro-stacks/clarity';
import { validateContractCall } from '../contract-abi';
import {
  createMultiSigSpendingCondition,
  createSingleSigSpendingCondition,
  createSponsoredAuth,
  createStandardAuth,
} from '../authorization';
import { PostCondition } from '../postcondition';
import { createLPList } from '../types';
import { bytesToHex, hexToBytes, omit, TransactionVersion } from 'micro-stacks/common';
import { c32address, StacksNetworkVersion } from 'micro-stacks/crypto';
import {
  createStacksPrivateKey,
  getPublicKeyFromStacksPrivateKey,
  pubKeyfromPrivKey,
  publicKeyFromBuffer,
  publicKeyToString,
} from '../keys';
import { TransactionSigner } from '../signer';
import {
  SignedContractCallOptions,
  SignedMultiSigContractCallOptions,
  UnsignedContractCallOptions,
  UnsignedMultiSigContractCallOptions,
} from './types';
import { getNonce } from '../fetchers/get-nonce';
import { getAbi } from '../fetchers/get-abi';
import { estimateContractFunctionCall } from '../fetchers/estimate-contract-function-call';

/**
 * Generates an unsigned Clarity smart contract function call transaction
 *
 * @param {UnsignedContractCallOptions | UnsignedMultiSigContractCallOptions} txOptions - an options object for the contract call
 *
 * @returns {Promise<StacksTransaction>}
 */
export async function makeUnsignedContractCall(
  txOptions: UnsignedContractCallOptions | UnsignedMultiSigContractCallOptions
): Promise<StacksTransaction> {
  const defaultOptions = {
    fee: BigInt(0),
    nonce: BigInt(0),
    network: new StacksMainnet(),
    postConditionMode: PostConditionMode.Deny,
    sponsored: false,
  };

  const options = Object.assign(defaultOptions, txOptions);

  const payload = createContractCallPayload(
    options.contractAddress,
    options.contractName,
    options.functionName,
    options.functionArgs
  );

  if (options?.validateWithAbi) {
    let abi: ClarityAbi;
    if (typeof options.validateWithAbi === 'boolean') {
      if (options?.network) {
        abi = await getAbi(options.contractAddress, options.contractName, options.network);
      } else {
        throw new Error('Network option must be provided in order to validate with ABI');
      }
    } else {
      abi = options.validateWithAbi;
    }

    validateContractCall(payload, abi);
  }

  let spendingCondition = null;
  let authorization = null;

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

  if (txOptions.fee === undefined || txOptions.fee === null) {
    const txFee = await estimateContractFunctionCall(transaction, options.network);
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

  return transaction;
}

/**
 * Generates a Clarity smart contract function call transaction
 *
 * @param  {SignedContractCallOptions | SignedMultiSigContractCallOptions} txOptions - an options object for the contract function call
 *
 * Returns a signed Stacks smart contract function call transaction.
 *
 * @return {StacksTransaction}
 */
export async function makeContractCall(
  txOptions: SignedContractCallOptions | SignedMultiSigContractCallOptions
): Promise<StacksTransaction> {
  if ('senderKey' in txOptions) {
    const privKey = createStacksPrivateKey(txOptions.senderKey);
    const publicKey = publicKeyToString(getPublicKeyFromStacksPrivateKey(privKey));
    const options = omit(txOptions, 'senderKey');
    const transaction = await makeUnsignedContractCall({ publicKey, ...options });

    const signer = new TransactionSigner(transaction);
    await signer.signOrigin(privKey);

    return transaction;
  } else {
    const options = omit(txOptions, 'signerKeys');
    const transaction = await makeUnsignedContractCall(options);

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
