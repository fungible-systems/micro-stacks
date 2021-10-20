import { authenticate, SESSION_STORAGE_KEY } from 'micro-stacks/connect';
import { useCallback } from 'react';
import { useAuthOptions, useIsSignedIn, useSession } from './use-session';
import { useLoading } from './use-loading';
import { LOADING_KEYS } from '../constants';
import { useDefaultStorageAdapter } from './use-storage-adapter';

export function useAuth() {
  const [sessionState, setSessionState] = useSession();
  const [isSignedIn, setIsSignedIn] = useIsSignedIn();
  const authOptions = useAuthOptions();
  const [isLoading, setIsLoading] = useLoading(LOADING_KEYS.AUTHENTICATION);
  const storageAdapter = useDefaultStorageAdapter();

  const handleSignIn = useCallback(
    async (onFinish?: (payload: any) => void) => {
      if (!authOptions) throw Error('[useAuthenticate] No authOptions provided.');
      setIsLoading(true);
      return authenticate(
        {
          manifestPath: '/',
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
    storageAdapter.removeItem(SESSION_STORAGE_KEY);
    setSessionState(null);
    setIsSignedIn(false);
  }, [setSessionState, setIsSignedIn, storageAdapter]);

  return {
    isLoading,
    isSignedIn,
    handleSignIn,
    handleSignOut,
    session: sessionState,
  };
}
