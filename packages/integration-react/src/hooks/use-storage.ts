import { useMicroStacksClient } from './use-client';
import { useCallback, useState } from 'react';
import { Model, Storage, createClientAdapter } from '@micro-stacks/storage';

type UseStorage = Pick<Storage, 'putFile' | 'getFile' | 'listFiles' | 'deleteFile'>;

export const useStorage = (options?: { gaiaHubUrl?: string }): UseStorage => {
  const client = useMicroStacksClient();
  const [storage] = useState(
    () =>
      new Storage({
        client,
        gaiaHubUrl: options?.gaiaHubUrl,
      })
  );
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
    gaiaHubUrl?: string;
    makeId?: (data: T) => string;
  }
): Model<T> => {
  const client = useMicroStacksClient();
  const [model] = useState(
    () =>
      new Model<T>({
        type,
        adapter: createClientAdapter(client, {
          gaiaHubUrl: options?.gaiaHubUrl,
        }),
        makeId: options?.makeId,
      })
  );
  return model;
};
