import { authenticate, PersistedDataKeys } from 'micro-stacks/connect';
import { useCallback } from 'react';
import { useAuthOptions, useIsSignedIn, useResetSessionCallback, useSession } from './use-session';
import { useLoading } from './use-loading';
import { LOADING_KEYS } from '../constants';
import { useDefaultStorageAdapter } from './use-storage-adapter';

export function useAuth() {
  const [sessionState, setSessionState] = useSession();
  const [isSignedIn, setIsSignedIn] = useIsSignedIn();
  const authOptions = useAuthOptions();
  const [isLoading, setIsLoading] = useLoading(LOADING_KEYS.AUTHENTICATION);
  const storageAdapter = useDefaultStorageAdapter();
  const resetSession = useResetSessionCallback();
  const handleSignIn = useCallback(
    async (onFinish?: (payload: any) => void) => {
      if (!authOptions) throw Error('[useAuthenticate] No authOptions provided.');
      setIsLoading(true);
      return authenticate(
        {
          ...authOptions,
          onFinish: payload => {
            if (onFinish) onFinish(payload);
            authOptions?.onFinish?.(payload);
            setSessionState(payload);
            setIsSignedIn(true);
            setIsLoading(false);
          },
          onCancel: error => {
            console.error(error);
            setIsLoading(false);
          },
        },
        storageAdapter
      );
    },
    [setSessionState, setIsLoading, setIsSignedIn, storageAdapter, authOptions]
  );

  const handleSignOut = useCallback(() => {
    storageAdapter.removeItem(PersistedDataKeys.SessionStorageKey);
    resetSession();
    authOptions?.onSignOut?.();
  }, [resetSession, authOptions, storageAdapter]);

  return {
    isLoading,
    isSignedIn,
    handleSignIn,
    handleSignOut,
    session: sessionState,
  };
}
