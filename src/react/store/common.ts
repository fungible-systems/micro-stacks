import { atomFamily, atomWithDefault } from 'jotai/utils';

export type OnMountUpdate = { type: 'mount' } | { type: 'unmount' };

type SetAtom<Update> = undefined extends Update
  ? (update?: Update) => void
  : (update: Update) => void;

export function onMountEffect(setAtom: SetAtom<OnMountUpdate>) {
  setAtom({ type: 'mount' });
  return () => {
    setAtom({
      type: 'unmount',
    });
  };
}

export const loadingStateAtom = (initialValue = false) =>
  atomFamily<string, boolean, boolean>(_key => atomWithDefault<boolean>(() => initialValue));
