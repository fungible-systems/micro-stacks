import { useAtom } from 'jotai';
import { loadingStateAtom } from '../store/common';
import { useMemo } from 'react';

export function useLoading(key: string, initialValue = false) {
  const atom = useMemo(() => loadingStateAtom(initialValue)(key), [key, initialValue]);
  return useAtom<boolean, boolean, void>(atom);
}
