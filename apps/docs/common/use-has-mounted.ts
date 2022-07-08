import React from 'react';
import { atom, useAtom } from 'jotai';

const mountedState = atom(false);

export function useHasMounted() {
  const [hasMounted, setHasMounted] = useAtom(mountedState);
  React.useEffect(() => {
    setHasMounted(true);
  }, []);
  return hasMounted;
}
