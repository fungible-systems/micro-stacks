import { atom, Getter } from 'jotai';
import { AsyncStorageAdapter, defaultStorageAdapter, StorageAdapter } from 'micro-stacks/connect';
import { atomWithDefault } from 'jotai/utils';
import { SetStateAction } from 'react';
import { OnMountUpdate } from './common';

export const storageAdapterAtom = atom<StorageAdapter<any>>(defaultStorageAdapter);
export const defaultStorageAdapterAtom = atom<StorageAdapter<string>>(() => defaultStorageAdapter);

export type GetInitialValue<Value> = (get: Getter) => Value;

export function atomWithStorageAdapter<Value>(
  key: string,
  initialValue: Value | GetInitialValue<Value>,
  serialize: (val: Value) => string = JSON.stringify,
  deserialize: (str: string) => Value = JSON.parse
) {
  const getInitialValue = (get: Getter) =>
    typeof initialValue === 'function'
      ? (initialValue as GetInitialValue<Value>)(get)
      : initialValue;
  const getWrappedStorage = (get: Getter) => {
    const storage = get(storageAdapterAtom);
    return {
      getItem: (key: string) => {
        const storedValue = storage.getItem(key);
        if (storedValue === null) {
          throw new Error('no value stored');
        }
        return deserialize(storedValue);
      },
      setItem: (key: string, newValue: Value) => {
        storage.setItem(key, serialize(newValue));
      },
    } as StorageAdapter<Value>;
  };

  const getLocalItem = (get: Getter) => {
    const storage = getWrappedStorage(get);
    try {
      const localValue = storage.getItem(key);
      if (localValue) return localValue;
    } catch (_e) {}
  };

  const baseAtom = atomWithDefault(get => getLocalItem(get) || getInitialValue(get));

  const anAtom = atom<Value, OnMountUpdate | SetStateAction<Value>>(
    get => get(baseAtom),
    (get, set, update) => {
      if (update) {
        const storage = getWrappedStorage(get);
        if ('type' in update) {
          try {
            const localValue = storage.getItem(key);
            if (localValue) {
              set(baseAtom, localValue);
            }
          } catch (_e) {}
        } else {
          const newValue =
            typeof update === 'function'
              ? (update as (prev: Value) => Value)(get(baseAtom))
              : update;
          storage.setItem(key, newValue);
          set(baseAtom, newValue);
        }
      }
    }
  );
  anAtom.onMount = setAtom => {
    setAtom({ type: 'mount' });
  };
  anAtom.debugLabel = 'atomWithStorageAdapter';
  return anAtom;
}

export function atomWithAsyncStorageAdapter<Value>(
  key: string,
  initialValue: Value | GetInitialValue<Value>,
  serialize: (val: Value) => string = JSON.stringify,
  deserialize: (str: string) => Value = JSON.parse
) {
  const getInitialValue = (get: Getter) =>
    typeof initialValue === 'function'
      ? (initialValue as GetInitialValue<Value>)(get)
      : initialValue;
  const getWrappedStorage = (get: Getter) => {
    const storage = get(storageAdapterAtom);
    return {
      getItem: (key: string) =>
        new Promise((resolve, reject) => {
          const storedValue = storage.getItem(key);
          if (storedValue === null) {
            reject(new Error('no value stored'));
          }
          resolve(deserialize(storedValue));
        }),
      setItem: (key: string, newValue: Value) =>
        new Promise(resolve => {
          storage.setItem(key, serialize(newValue));
          resolve();
        }),
    } as AsyncStorageAdapter<Value>;
  };

  const baseAtom = atomWithDefault(async get => {
    const storage = getWrappedStorage(get);
    try {
      const localValue = await storage.getItem(key);
      if (localValue) return localValue;
    } catch (_e) {}
    return getInitialValue(get);
  });

  const anAtom = atom<Value, OnMountUpdate | SetStateAction<Value>>(
    get => get(baseAtom),
    async (get, set, update) => {
      if (update) {
        const storage = getWrappedStorage(get);
        if ('type' in update) {
          try {
            const localValue = await storage.getItem(key);
            if (localValue) {
              set(baseAtom, localValue);
            }
          } catch (_e) {}
        } else {
          const newValue =
            typeof update === 'function'
              ? (update as (prev: Value) => Value)(get(baseAtom))
              : update;
          await storage.setItem(key, newValue);
          set(baseAtom, newValue);
        }
      }
    }
  );
  anAtom.onMount = setAtom => {
    setAtom({ type: 'mount' });
  };
  anAtom.debugLabel = 'atomWithAsyncStorageAdapter';
  return anAtom;
}
