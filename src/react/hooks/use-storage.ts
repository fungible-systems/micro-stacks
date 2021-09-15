import { useSession } from './use-session';
import { getFile as _getFile, putFile as _putFile } from 'micro-stacks/storage';
import type { GetFileOptions, PutFileOptions } from 'micro-stacks/storage';
import { useCallback } from 'react';
import type { SetOptional } from '../types';
import { useGaiaHubConfig } from './use-gaia-hub-config';

export function useGaia() {
  const [session] = useSession();
  const gaiaHubConfig = useGaiaHubConfig();
  const getFile = useCallback(
    async (path: string, params: SetOptional<GetFileOptions, 'gaiaHubConfig'> = {}) => {
      const options = params;
      if (!params.privateKey) options.privateKey = session?.appPrivateKey;
      if (!params.gaiaHubConfig) options.gaiaHubConfig = gaiaHubConfig;
      return _getFile(path, options as GetFileOptions);
    },
    [session, gaiaHubConfig]
  );

  const putFile = useCallback(
    async (
      path: string,
      content: string | Uint8Array | ArrayBufferView | Blob,
      params: SetOptional<PutFileOptions, 'gaiaHubConfig'> = {}
    ) => {
      if (!session) throw Error('useGaia - putFile: No user session, are they logged in?');
      const options = params;
      options.privateKey = session.appPrivateKey;
      if (!options.gaiaHubConfig && gaiaHubConfig) options.gaiaHubConfig = gaiaHubConfig;

      return _putFile(path, content, options as PutFileOptions);
    },
    [session, gaiaHubConfig]
  );

  return {
    putFile,
    getFile,
  };
}
