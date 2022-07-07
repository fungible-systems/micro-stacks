type BaseStorage = Pick<Storage, 'getItem' | 'setItem' | 'removeItem'>;

export const DEFAULT_PREFIX = 'micro-stacks';

export type ClientStorage<V = unknown> = {
  getItem: <Value = V>(key: string, defaultValue?: Value | null) => Value | null;
  setItem: <Value>(key: string, value: Value | null) => void;
  removeItem: (key: string) => void;
};

export const noopStorage: BaseStorage = {
  getItem: _key => null,
  setItem: (_key, _value) => {},
  removeItem: _key => {},
};

export const defaultStorage = createStorage({
  storage: typeof window !== 'undefined' ? window.localStorage : noopStorage,
  serialize: JSON.stringify,
  deserialize: JSON.parse,
});

export function createStorage<V = unknown>({
  storage,
  key: prefix = DEFAULT_PREFIX,
  serialize,
  deserialize,
}: {
  storage: BaseStorage;
  serialize?: any;
  deserialize?: any;
  key?: string;
}): ClientStorage<V> {
  return {
    ...storage,
    getItem: (key, defaultState = null) => {
      const _key = `${prefix}.${key.replace(`${prefix}.`, '')}`;
      const value = storage.getItem(_key);
      if (!deserialize) return value ?? defaultState;
      try {
        return value ? deserialize(value) : defaultState;
      } catch (error) {
        console.warn(error);
        return defaultState;
      }
    },
    setItem: (key, value) => {
      const _key = `${prefix}.${key.replace(`${prefix}.`, '')}`;
      if (value === null) {
        storage.removeItem(_key);
      } else {
        try {
          const v = serialize ? serialize(value) : value;
          storage.setItem(_key, v);
        } catch (error) {
          console.error(error);
        }
      }
    },
    removeItem: key => storage.removeItem(`${prefix}.${key}`),
  };
}
