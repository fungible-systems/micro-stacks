import { useAtomValue } from 'jotai/utils';
import { storageAdapterAtom } from '../store/storage-adapter';
import { defaultStorageAdapter } from 'micro-stacks/connect';

export function useStorageAdapter() {
  return useAtomValue(storageAdapterAtom);
}

export function useDefaultStorageAdapter() {
  return defaultStorageAdapter;
}
