export enum TxType {
  ContractCall = 'contract_call',
  TokenTransfer = 'token_transfer',
  ContractDeploy = 'contract_deploy',
}

export enum StatusKeys {
  Authentication = 'status/Authentication',
  TransactionSigning = 'status/TransactionSigning',
  MessageSigning = 'status/MessageSigning',
  StructuredMessageSigning = 'status/StructuredMessageSigning',
  PsbtSigning = 'status/PsbtSigning',
}

export enum Status {
  IsLoading = 'status/IsLoading',
  IsIdle = 'status/IsIdle',
}

export const STORE_KEY = 'store';

export const IS_SSR = typeof document === 'undefined';
