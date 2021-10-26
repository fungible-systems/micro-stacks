// https://github.com/sindresorhus/type-fest
import { AuthOptions, StorageAdapter } from 'micro-stacks/connect';
import { Atom } from 'jotai';
import { StacksNetwork } from 'micro-stacks/network';

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

export type NetworkType = StacksNetwork | 'mainnet' | 'testnet' | 'mocknet';

export interface MicroStacksProviderProps {
  authOptions: AuthOptions;
  storageAdapter?: StorageAdapter<unknown>;
  network?: NetworkType;
  initialValues?: Iterable<readonly [Atom<unknown>, unknown]>;
}

export interface AppProviderAtomBuilder {
  /** Web wallet authOptions */
  authOptions: AuthOptions;
  /** a custom storage adapter */
  storageAdapter?: StorageAdapter<unknown>;
  /** the network for the app (testnet | mainnet) */
  network?: StacksNetwork | 'mainnet' | 'testnet';
  partialStacksSession?: {
    addresses: {
      mainnet: string;
      testnet: string;
    };
    identityAddress: string;
    profile_url: string;
    hubUrl: string;
  };
}
