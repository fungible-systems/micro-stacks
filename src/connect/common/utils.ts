import { getGlobalObject } from 'micro-stacks/common';
import { IS_BROWSER } from './constants';

const _localStorage = getGlobalObject('localStorage', { returnEmptyObject: true });

type Unsubscribe = () => void;

export interface StorageAdapter<Value> {
  setItem(key: string, value: Value): void;

  getItem(key: string): Value | null | undefined;

  removeItem(key: string): void;

  subscribe?: (key: string, callback: (value: Value) => void) => Unsubscribe;
}

export interface AsyncStorageAdapter<Value> {
  setItem(key: string, value: Value): Promise<void>;

  getItem(key: string): Promise<Value | null | undefined>;

  removeItem(key: string): Promise<void>;

  subscribe?: (key: string, callback: (value: Value) => void) => Unsubscribe;
}

export const defaultStorageAdapter: StorageAdapter<string> = {
  setItem: (key: string, value: string) => {
    if (IS_BROWSER) return _localStorage?.setItem(key, value);
  },
  getItem: (key: string) => {
    if (IS_BROWSER) {
      const storedValue = _localStorage?.getItem(key);
      if (storedValue === null) throw new Error('defaultStorageAdapter: no value stored');
      return storedValue;
    }
  },
  removeItem: (key: string) => {
    if (IS_BROWSER) return _localStorage?.removeItem(key);
  },
};
