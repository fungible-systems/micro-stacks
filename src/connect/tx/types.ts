import type { StacksNetwork } from 'micro-stacks/network';
import type { ClarityAbi, ClarityValue } from 'micro-stacks/clarity';
import type { PostConditionMode, PostCondition } from 'micro-stacks/transactions';

export enum TransactionTypes {
  ContractCall = 'contract_call',
  ContractDeploy = 'smart_contract',
  STXTransfer = 'token_transfer',
}

export interface TransactionOptionsBase {
  privateKey: string;
  appDetails?: {
    name: string;
    icon: string;
  };
  postConditionMode?: PostConditionMode;
  postConditions?: (string | PostCondition)[];
  network?: StacksNetwork;
  stxAddress?: string;
  sponsored?: boolean;
  attachment?: string;
}

export interface TransactionPayloadBase {
  appDetails?: {
    name: string;
    icon: string;
  };
  stxAddress?: string;
  network?: StacksNetwork;
  publicKey: string;
  postConditionMode?: PostConditionMode;
  postConditions?: (string | PostCondition)[];
  onFinish?: (data: any) => void;
  onCancel?: (error: any) => void;
}

/**
 * Contract Deploy
 */

export interface ContractDeployTxOptions extends TransactionOptionsBase {
  contractName: string;
  codeBody: string;
}

export interface ContractDeployTxPayload extends TransactionPayloadBase {
  contractName: string;
  codeBody: string;
  txType: TransactionTypes.ContractDeploy;
}

/**
 * Contract Call
 */
export interface ContractCallTxOptions extends TransactionOptionsBase {
  contractAddress: string;
  contractName: string;
  functionName: string;
  functionArgs: string[] | ClarityValue[];
  validateWithAbi?: boolean | ClarityAbi;
}

export interface ContractCallTxPayload extends TransactionPayloadBase {
  contractAddress: string;
  contractName: string;
  functionName: string;
  functionArgs: (string | ClarityValue)[];
  txType: TransactionTypes.ContractCall;
}

/**
 * STX transfer
 */

export interface StxTransferTxOptions extends TransactionOptionsBase {
  recipient: string;
  amount: bigint | string;
  memo?: string;
  onFinish?: (data: any) => void;
}

export interface StxTransferTxPayload extends TransactionPayloadBase {
  recipient: string;
  publicKey: string;
  amount: string;
  memo?: string;
  txType: TransactionTypes.STXTransfer;
}
