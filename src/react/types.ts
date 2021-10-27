import { ClarityValue } from 'micro-stacks/clarity';
import { StacksNetwork } from 'micro-stacks/network';

// https://github.com/sindresorhus/type-fest
export type Except<ObjectType, KeysType extends keyof ObjectType> = Pick<
  ObjectType,
  Exclude<keyof ObjectType, KeysType>
>;
export type Simplify<T> = { [KeyType in keyof T]: T[KeyType] };
export type SetOptional<BaseType, Keys extends keyof BaseType> = Simplify<
  // Pick just the keys that are readonly from the base type.
  Except<BaseType, Keys> &
    // Pick the keys that should be mutable from the base type and make them mutable.
    Partial<Pick<BaseType, Keys>>
>;
export type WithLimit<T> = T & { limit?: number };
export type WithHeight<T> = T & { height?: number };

export type UseCallback<T extends (...args: any[]) => any> = ((
  ...args: Parameters<T>
) => ReturnType<T>) & { __IS_USE_CALLBACK?: undefined };

declare function useCallback<T extends (...args: any[]) => any>(
  callback: T,
  deps: readonly any[]
): UseCallback<T>;

export type WithNetwork = [networkUrl: string];

export type IdWithNetwork = [id: string, networkUrl: string];

export type NetworkWithTld = [networkUrl: string, tld: string];

export type NetworkWithName = [networkUrl: string, name: string];

export type NetworkWithLimitOffset = [networkUrl: string, limit?: number, offset?: number];

export type NetworkWithPage = [networkUrl: string, page: number];

export type NetworkWithTxid = [networkUrl: string, txid: string];

export type NetworkWithNameZoneFileHash = [networkUrl: string, name: string, zoneFileHash: string];

export type NetworkWithBlockchainAddress = [
  networkUrl: string,
  blockchain: string,
  address: string
];

export type NetworkWithAddressLimitOffset = [
  networkUrl: string,
  address: string,
  limit?: number,
  offset?: number
];

export type NetworkWithAddress = [networkUrl: string, address: string];

export type NetworkWithBlockHash = [networkUrl: string, hash: string];

export type NetworkWithBlockHeight = [networkUrl: string, height: number];

export type NetworkWithBurnBlockHash = [networkUrl: string, burn_block_hash: string];

export type NetworkWithBurnBlockHeight = [networkUrl: string, burn_block_height: number];

export type NetworkWithTransaction = [networkUrl: string, transaction: string];

export type NetworkWithAddressStacking = [networkUrl: string, address: string, stacking?: boolean];

export type NetworkWithContractId = [networkUrl: string, contractId: string];

export type NetworkWithContractIdUnanchored = [
  networkUrl: string,
  contractId: string,
  unanchored: boolean
];

export type NetworkWithContractIdUnanchoredLimitOffset = [
  networkUrl: string,
  contractId: string,
  unanchored: boolean,
  limit?: number,
  offset?: number
];

export type NetworkWithContractAddressContractNameTip = [
  networkUrl: string,
  contract_address: string,
  contract_name: string,
  tip: string
];

export type NetworkWithContractAddressContractNameMapNameProofTipLookupKey = [
  networkUrl: string,
  contract_address: string,
  contract_name: string,
  map_name: string,
  proof: number,
  tip: string,
  lookup_key: string
];

export type NetworkWithContractAddressContractNameProofTip = [
  networkUrl: string,
  contract_address: string,
  contract_name: string,
  proof: number,
  tip: string
];

export type ContractNameContractAddressFunctionNameFunctionArgsSenderAddressNetworkTip = [
  networkUrl: string,
  contractName: string,
  contractAddress: string,
  functionName: string,
  functionArgs: string[],
  senderAddress: string,
  /** the network that the contract which contains the function is deployed to */
  // TODO: add network to client
  //network?: string,
  tip?: string
];
