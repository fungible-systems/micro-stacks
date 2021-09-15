import { Atom, atom, useAtom } from 'jotai';
import { useAtomValue } from 'jotai/utils';
import { useMemo } from 'react';

const noopAtom = atom(null);

type Falsy = false | 0 | '' | null | undefined;

const isTruthy = <T>(x: T | Falsy): x is T => !!x;

function isArrayInstanceof<T>(arr: any): arr is T[] {
  if (!Array.isArray(arr)) return false;
  return arr.every(isTruthy);
}

export function useConditionalAtomValue<T, P>(atom: (param: P) => Atom<T>, param: P | undefined) {
  const hasValues = isTruthy<P>(param);
  return useAtomValue(hasValues ? atom(param as P) : noopAtom);
}

export function useConditionalAtom<T, P, U>(
  conditionalAtom: (param: P) => Atom<T>,
  param: P | undefined
) {
  const hasValues = isTruthy<P>(param);
  const anAtom = useMemo(() => conditionalAtom(param as P), [param, conditionalAtom]);
  const theAtom = useMemo(() => (hasValues ? anAtom : (noopAtom as any)), [hasValues, anAtom]);
  return useAtom<T, U>(theAtom);
}
