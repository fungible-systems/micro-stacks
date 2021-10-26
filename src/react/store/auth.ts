import { atom } from 'jotai';
import { selectAtom } from 'jotai/utils';
import { PersistedDataKeys } from 'micro-stacks/connect';

import { onMountEffect } from './common';

import type { StacksSessionState, AuthOptions } from 'micro-stacks/connect';
import { atomWithStorageAdapter } from './storage-adapter';

export const authOptionsAtom = atom<AuthOptions | null>(null);

export const partialStacksSessionAtom = atom<null | Partial<StacksSessionState>>(null);

export const stacksSessionAtom = atomWithStorageAdapter<StacksSessionState | null>(
  PersistedDataKeys.SessionStorageKey,
  null
);

export const asyncStacksSessionAtom = atomWithStorageAdapter<StacksSessionState | null>(
  PersistedDataKeys.SessionStorageKey,
  get => get(stacksSessionAtom)
);

const combinedSessionAtom = atom(get => {
  const isSignedIn = get(isSignedInAtom);
  if (!isSignedIn) return null;
  const partial = get(partialStacksSessionAtom);
  const full = get(stacksSessionAtom);
  return typeof partial === 'undefined' && typeof full === 'undefined'
    ? null
    : {
        ...(partial || {}),
        ...(full || {}),
      };
});

export const userDataAtom = atom<null | {
  appPrivateKey?: string;
  hubUrl?: string;
  profile_url?: string;
  addresses: {
    mainnet: string;
    testnet: string;
  };
}>(get => {
  const state = get(combinedSessionAtom);
  if (state?.addresses && state.addresses.mainnet) {
    return {
      appPrivateKey: state!.appPrivateKey,
      hubUrl: state.hubUrl,
      addresses: state!.addresses,
      profile_url: state!.profile_url,
      identityAddress: state!.identityAddress,
    };
  }
  return null;
});

export const _isSignedInAtom = atom(false);

export const isSignedInAtom = atom<boolean, { type: 'mount' | 'unmount' } | boolean>(
  get => get(_isSignedInAtom),
  (get, set, update) => {
    if (typeof update !== 'boolean' && 'type' in update) {
      if (update.type === 'mount')
        set(_isSignedInAtom, !!get(stacksSessionAtom) || !!get(partialStacksSessionAtom));
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
