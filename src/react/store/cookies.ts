import { atom } from 'jotai';
import { atomWithStorage } from 'jotai/utils';
import { cookies } from '../utils';

const cookieMap = new Map();
export const useCookiesAtom = atom(false);
export const atomWithCookieStorage = (key: string, value: string) => {
  const match = cookieMap.get(key);
  if (match) return match;
  const { get, set } = cookies();
  const anAtom = atomWithStorage<string | undefined>(key, value, {
    getItem: get,
    setItem: (key, newValue) => {
      // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
      set(key, newValue as any, {});
    },
  });
  cookieMap.set(key, anAtom);
  return anAtom;
};
