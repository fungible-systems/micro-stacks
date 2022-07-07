import { TransactionVersion } from 'micro-stacks/common';
import { StacksMainnet } from 'micro-stacks/network';
import { AddressHashMode, PostConditionMode } from '../common/constants';
import { PostCondition } from '../postcondition';
import { StacksTransaction } from '../transaction';
import { createSmartContractPayload } from '../payload';
import {
  createStacksPrivateKey,
  getPublicKeyFromStacksPrivateKey,
  publicKeyToString,
} from '../keys';
import {
  createSingleSigSpendingCondition,
  createSponsoredAuth,
  createStandardAuth,
} from '../authorization';
import { createLPList } from '../types';
import { publicKeyToStxAddress, StacksNetworkVersion } from 'micro-stacks/crypto';
import { TransactionSigner } from '../signer';
import { ContractDeployOptions } from './types';
import { getNonce } from '../fetchers/get-nonce';
import { estimateContractDeploy } from '../fetchers/estimate-contract-deploy';

/**
 * Generates a Clarity smart contract deploy transaction
 *
 * @param  {ContractDeployOptions} txOptions - an options object for the contract deploy
 *
 * Returns a signed Stacks smart contract deploy transaction.
 *
 * @return {StacksTransaction}
 */
export async function makeContractDeploy(
  txOptions: ContractDeployOptions
): Promise<StacksTransaction> {
  const defaultOptions = {
    fee: BigInt(0),
    nonce: BigInt(0),
    network: new StacksMainnet(),
    postConditionMode: PostConditionMode.Deny,
    sponsored: false,
  };

  const options = Object.assign(defaultOptions, txOptions);

  const payload = createSmartContractPayload(options.contractName, options.codeBody);

  const addressHashMode = AddressHashMode.SerializeP2PKH;
  const privKey = createStacksPrivateKey(options.senderKey);
  const pubKey = getPublicKeyFromStacksPrivateKey(privKey);

  let authorization = null;

  const spendingCondition = createSingleSigSpendingCondition(
    addressHashMode,
    publicKeyToString(pubKey),
    options.nonce,
    options.fee
  );

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
    const txFee = await estimateContractDeploy(transaction, options.network);
    transaction.setFee(txFee);
  }

  if (txOptions.nonce === undefined || txOptions.nonce === null) {
    const addressVersion =
      options.network.version === TransactionVersion.Mainnet
        ? StacksNetworkVersion.mainnetP2PKH
        : StacksNetworkVersion.testnetP2PKH;
    const senderAddress = publicKeyToStxAddress(publicKeyToString(pubKey), addressVersion);
    const txNonce = await getNonce(senderAddress, options.network);
    transaction.setNonce(txNonce);
  }

  if (options.senderKey) {
    const signer = new TransactionSigner(transaction);
    await signer.signOrigin(privKey);
  }

  return transaction;
}
