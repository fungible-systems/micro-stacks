import { useAtom } from 'jotai';
import {
  asyncStacksSessionAtom,
  authOptionsAtom,
  isSignedInAtom,
  partialStacksSessionAtom,
  stacksSessionAtom,
} from '../store/auth';
import { useAtomValue } from 'jotai/utils';
import { StacksSessionState } from 'micro-stacks/connect';
import { useCallback } from 'react';

type SetAtom<Update> = undefined extends Update
  ? (update?: Update) => void
  : (update: Update) => void;

export function useSession(): [
  null | Partial<StacksSessionState>,
  SetAtom<StacksSessionState | null>
] {
  const [partialSession] = useAtom(partialStacksSessionAtom);
  const [session, setSession] = useAtom(stacksSessionAtom);

  const combined = !(session && partialSession)
    ? null
    : ({
        ...(session || {}),
        ...(partialSession || {}),
      } as Partial<StacksSessionState>);
  return [combined, setSession as SetAtom<StacksSessionState | null>];
}

export function useResetSessionCallback() {
  const [, setPartial] = useAtom(partialStacksSessionAtom);
  const [, setSession] = useAtom(stacksSessionAtom);
  const [, setIsSignedIn] = useAtom(isSignedInAtom);
  return useCallback(() => {
    setPartial(null);
    setSession(null);
    setIsSignedIn(false);
  }, [setPartial, setSession, setIsSignedIn]);
}

export function useAsyncSession() {
  return useAtom(asyncStacksSessionAtom);
}

export function useAuthOptions() {
  return useAtomValue(authOptionsAtom);
}

/**
 * Get if the user is currently signed in
 *
 * @return [isSignedIn: boolean, setIsSignedIn: SetAtom<boolean>]
 */
export function useIsSignedIn(): [isSignedIn: boolean, setIsSignedIn: SetAtom<boolean>] {
  const [isSignedIn, setIsSignedIn] = useAtom(isSignedInAtom);
  return [isSignedIn, setIsSignedIn];
}
