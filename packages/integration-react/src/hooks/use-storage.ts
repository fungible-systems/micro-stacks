import { useMicroStacksClient } from './use-client';
import { useCallback, useState } from 'react';
import { Model, Storage, createClientAdapter, GaiaConfig } from '@micro-stacks/storage';

type UseStorage = Pick<Storage, 'putFile' | 'getFile' | 'listFiles' | 'deleteFile'>;

const useStorageInstance = ({
  gaiaConfig,
  disableEtagCache,
}: { gaiaConfig?: GaiaConfig; disableEtagCache?: boolean } = {}) => {
  const client = useMicroStacksClient();

  const options: any = {
    disableEtagCache,
  };

  if (gaiaConfig) options['gaiaConfig'] = gaiaConfig;
  else options.client = client;

  const [storage] = useState(() => new Storage(options));
  return storage;
};

export const useStorage = (
  options: { gaiaConfig?: GaiaConfig; disableEtagCache?: boolean } = {}
): UseStorage => {
  const storage = useStorageInstance(options);
  return {
    putFile: useCallback((...args) => storage.putFile(...args), [storage]),
    getFile: useCallback((...args) => storage.getFile(...args), [storage]),
    listFiles: useCallback((...args) => storage.listFiles(...args), [storage]),
    deleteFile: useCallback((...args) => storage.deleteFile(...args), [storage]),
  };
};

export const useModel = <T>(
  type: string,
  options?: {
    gaiaConfig?: GaiaConfig;
    disableEtagCache?: boolean;
    makeId?: (data: T) => string;
  }
): Model<T> => {
  const storage = useStorageInstance({
    disableEtagCache: options?.disableEtagCache,
    gaiaConfig: options?.gaiaConfig,
  });
  const [model] = useState(
    () =>
      new Model<T>({
        type,
        adapter: createClientAdapter(storage),
        makeId: options?.makeId,
      })
  );
  return model;
};
