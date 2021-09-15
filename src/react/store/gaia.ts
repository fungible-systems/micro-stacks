// THIS IS A WIP
import { makeAtomFamilyWithQuery, makeQueryKey } from 'jotai-query-toolkit';
import { SetOptional } from '../types';
import { getFile as _getFile, GetFileOptions } from 'micro-stacks/storage';
import { primaryGaiaHubConfigAtom } from './storage';
import { stacksSessionAtom } from './auth';

export enum GaiaKeys {
  Getfile = 'gaia/GetFile',
}

export const gaiaQueryKeys = {
  GetFile: (params: [path: string, options?: SetOptional<GetFileOptions, 'gaiaHubConfig'>]) =>
    makeQueryKey(GaiaKeys.Getfile, params),
};

export const gaiaQueryAtom = makeAtomFamilyWithQuery<
  {
    path: string;
    options?: SetOptional<GetFileOptions, 'gaiaHubConfig'>;
    defaultFile?: any;
    deserialize?: (value: string) => any;
  },
  unknown
>({
  queryKey: GaiaKeys.Getfile,
  queryFn(get, param) {
    const session = get(stacksSessionAtom);
    if (!session) {
      return;
    }
    const gaiaHubConfig = get(primaryGaiaHubConfigAtom);
    if (!gaiaHubConfig) {
      return;
    }
    const { path, deserialize = JSON.parse } = param;
    return _getFile(path, {
      privateKey: session.appPrivateKey,
      gaiaHubConfig,
    })
      .then(data => {
        if (typeof data !== 'string') return data;
        return deserialize(data);
      })
      .catch(e => {
        console.error(e);
        return param?.defaultFile;
      });
  },
});
