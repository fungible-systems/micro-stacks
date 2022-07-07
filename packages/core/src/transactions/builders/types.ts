import { ClarityAbi, ClarityValue, PrincipalCV } from 'micro-stacks/clarity';
import { IntegerType } from 'micro-stacks/common';
import { StacksNetwork } from 'micro-stacks/network';
import { AddressHashMode, AnchorMode, PostConditionMode } from '../common/constants';
import { PostCondition } from '../postcondition';
import { StacksTransaction } from '../transaction';

export interface MultiSigOptions {
  numSignatures: number;
  publicKeys: string[];
  signerKeys?: string[];
}

/**
 * Contract function call transaction options
 */
export interface ContractCallOptions {
  /** the Stacks address of the contract */
  contractAddress: string;
  contractName: string;
  functionName: string;
  functionArgs: ClarityValue[];
  /** transaction fee in microstacks */
  fee?: IntegerType;
  feeEstimateApiUrl?: string;
  /** the transaction nonce, which must be increased monotonically with each new transaction */
  nonce?: IntegerType;
  /** the Stacks blockchain network that will ultimately be used to broadcast this transaction */
  network?: StacksNetwork;
  /** the transaction anchorMode, which specifies whether it should be
   * included in an anchor block or a microblock */
  anchorMode: AnchorMode;
  /** the post condition mode, specifying whether or not post-conditions must fully cover all
   * transfered assets */
  postConditionMode?: PostConditionMode;
  /** a list of post conditions to add to the transaction */
  postConditions?: PostCondition[];
  /** set to true to validate that the supplied function args match those specified in
   * the published contract */
  validateWithAbi?: boolean | ClarityAbi;
  /** set to true if another account is sponsoring the transaction (covering the transaction fee) */
  sponsored?: boolean;
}

export interface UnsignedContractCallOptions extends ContractCallOptions {
  publicKey: string;
}

export interface SignedContractCallOptions extends ContractCallOptions {
  senderKey: string;
}

export interface UnsignedMultiSigContractCallOptions extends ContractCallOptions {
  numSignatures: number;
  publicKeys: string[];
}

export interface SignedMultiSigContractCallOptions extends ContractCallOptions {
  numSignatures: number;
  publicKeys: string[];
  signerKeys: string[];
}

/**
 * Contract deploy transaction options
 */
export interface ContractDeployOptions {
  contractName: string;
  /** the Clarity code to be deployed */
  codeBody: string;
  /** a hex string of the private key of the transaction sender */
  senderKey: string;
  /** transaction fee in microstacks */
  fee?: IntegerType;
  /** the transaction nonce, which must be increased monotonically with each new transaction */
  nonce?: IntegerType;
  /** the network that the transaction will ultimately be broadcast to */
  network?: StacksNetwork;
  /** the transaction anchorMode, which specifies whether it should be
   * included in an anchor block or a microblock */
  anchorMode: AnchorMode;
  /** the post condition mode, specifying whether or not post-conditions must fully cover all
   * transfered assets */
  postConditionMode?: PostConditionMode;
  /** a list of post conditions to add to the transaction */
  postConditions?: PostCondition[];
  /** set to true if another account is sponsoring the transaction (covering the transaction fee) */
  sponsored?: boolean;
}

/**
 * STX token transfer transaction options
 */
export interface TokenTransferOptions {
  /** the address of the recipient of the token transfer */
  recipient: string | PrincipalCV;
  /** the amount to be transfered in microstacks */
  amount: IntegerType;
  /** the transaction fee in microstacks */
  fee?: IntegerType;
  /** the transaction nonce, which must be increased monotonically with each new transaction */
  nonce?: IntegerType;
  /** the network that the transaction will ultimately be broadcast to */
  network?: StacksNetwork;
  /** the transaction anchorMode, which specifies whether it should be
   * included in an anchor block or a microblock */
  anchorMode: AnchorMode;
  /** an arbitrary string to include in the transaction, must be less than 34 bytes */
  memo?: string;
  /** the post condition mode, specifying whether or not post-conditions must fully cover all
   * transfered assets */
  postConditionMode?: PostConditionMode;
  /** a list of post conditions to add to the transaction */
  postConditions?: PostCondition[];
  /** set to true if another account is sponsoring the transaction (covering the transaction fee) */
  sponsored?: boolean;
}

export interface UnsignedTokenTransferOptions extends TokenTransferOptions {
  publicKey: string;
}

export interface SignedTokenTransferOptions extends TokenTransferOptions {
  senderKey: string;
}

export interface UnsignedMultiSigTokenTransferOptions extends TokenTransferOptions {
  numSignatures: number;
  publicKeys: string[];
}

export interface SignedMultiSigTokenTransferOptions extends TokenTransferOptions {
  numSignatures: number;
  publicKeys: string[];
  signerKeys: string[];
}

/**
 * Sponsored transaction options
 */
export interface SponsorOptionsOpts {
  /** the origin-signed transaction */
  transaction: StacksTransaction;
  /** the sponsor's private key */
  sponsorPrivateKey: string;
  /** the transaction fee amount to sponsor */
  fee?: IntegerType;
  /** the nonce of the sponsor account */
  sponsorNonce?: IntegerType;
  /** the hashmode of the sponsor's address */
  sponsorAddressHashmode?: AddressHashMode;
  /** the Stacks blockchain network that this transaction will ultimately be broadcast to */
  network?: StacksNetwork;
}
