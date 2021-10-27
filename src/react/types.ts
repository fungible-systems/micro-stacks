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

export type NetworkWithLimitOffset = [networkUrl: string, limit?: number, offset?: number];

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
