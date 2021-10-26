import { primaryGaiaHubConfigAtom } from '../store/storage';
import { useCallback } from 'react';
import { generateGaiaHubConfig, GenerateGaiaHubConfigOptions } from 'micro-stacks/storage';
import { useSession } from './use-session';
import { useAtomValue } from 'jotai/utils';

export function useGaiaHubConfig() {
  return useAtomValue(primaryGaiaHubConfigAtom);
}

export function useMakeGaiaHubConfig() {
  const [session] = useSession();
  return useCallback(
    async (params?: Omit<GenerateGaiaHubConfigOptions, 'privateKey' | 'gaiaHubUrl'>) => {
      if (!session || !session.appPrivateKey || !session.hubUrl)
        throw Error('useMakeGaiaHubConfig: no user session. Are they signed in?');
      return generateGaiaHubConfig({
        privateKey: session.appPrivateKey,
        gaiaHubUrl: session.hubUrl,
        ...params,
      });
    },
    [session]
  );
}
