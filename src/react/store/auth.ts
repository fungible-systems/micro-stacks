import { atom } from 'jotai';
import { selectAtom } from 'jotai/utils';
import { SESSION_STORAGE_KEY } from 'micro-stacks/connect';

import { onMountEffect } from './common';

import type { StacksSessionState, AuthOptions } from 'micro-stacks/connect';
import { atomWithStorageAdapter } from './storage-adapter';

export const authOptionsAtom = atom<AuthOptions | null>(null);

export const stacksSessionAtom = atomWithStorageAdapter<StacksSessionState | null>(
  SESSION_STORAGE_KEY,
  null
);

export const asyncStacksSessionAtom = atomWithStorageAdapter<StacksSessionState | null>(
  SESSION_STORAGE_KEY,
  get => get(stacksSessionAtom)
);

export const userDataAtom = selectAtom<
  StacksSessionState | null,
  null | {
    appPrivateKey: string;
    username: string | null;
    hubUrl: string;
    addresses: {
      mainnet: string;
      testnet: string;
    };
  }
>(stacksSessionAtom, state => {
  if (!state) return null;
  return {
    appPrivateKey: state.appPrivateKey,
    username: state.username,
    hubUrl: state.hubUrl,
    addresses: state.addresses,
  };
});

export const _isSignedInAtom = atom(false);
export const isSignedInAtom = atom<boolean, { type: 'mount' | 'unmount' } | boolean>(
  get => get(_isSignedInAtom),
  (get, set, update) => {
    if (typeof update !== 'boolean' && 'type' in update) {
      if (update.type === 'mount') {
        set(_isSignedInAtom, !!get(stacksSessionAtom));
      }
    } else {
      set(_isSignedInAtom, update);
    }
  }
);
isSignedInAtom.onMount = onMountEffect;

export const userStxAddressesAtom = selectAtom(userDataAtom, state => {
  if (!state) return null;
  return state.addresses;
});
