import { useAtom } from 'jotai';
import {
  asyncStacksSessionAtom,
  authOptionsAtom,
  isSignedInAtom,
  stacksSessionAtom,
} from '../store/auth';
import { useAtomValue } from 'jotai/utils';

type SetAtom<Update> = undefined extends Update
  ? (update?: Update) => void
  : (update: Update) => void;

export function useSession() {
  return useAtom(stacksSessionAtom);
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
