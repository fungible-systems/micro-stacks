import { Atom, atom } from 'jotai';
import {
  GaiaHubConfig,
  generateGaiaHubConfig,
  GenerateGaiaHubConfigOptions,
} from 'micro-stacks/storage';
import { atomFamily } from 'jotai/utils';
import { stacksSessionAtom } from './auth';
import { IS_SSR } from 'jotai-query-toolkit';

export const primaryGaiaHubConfigAtom = atom(get => {
  if (IS_SSR) return;
  const session = get(stacksSessionAtom);
  if (!session) {
    console.group('[micro-stacks] primaryGaiaHubConfigAtom');
    console.debug('makeGaiaHubConfigAtom: no user session. Are they signed in?');
    console.groupEnd();
    return;
  }
  return generateGaiaHubConfig({
    privateKey: session.appPrivateKey,
    gaiaHubUrl: session.hubUrl,
  });
});
primaryGaiaHubConfigAtom.debugLabel = 'primaryGaiaHubConfigAtom';

export const makeGaiaHubConfigAtom = atomFamily<
  Omit<GenerateGaiaHubConfigOptions, 'privateKey' | 'gaiaHubUrl'>,
  Promise<GaiaHubConfig> | undefined
>(params => {
  const anAtom = atom(get => {
    if (IS_SSR) return;
    const session = get(stacksSessionAtom);
    if (!session) {
      console.group('[micro-stacks] makeGaiaHubConfigAtom');
      console.debug('no user session. Are they signed in?');
      console.groupEnd();
      return;
    }
    return generateGaiaHubConfig({
      privateKey: session.appPrivateKey,
      gaiaHubUrl: session.hubUrl,
      ...params,
    });
  });
  anAtom.debugLabel = 'makeGaiaHubConfigAtom';
  return anAtom;
});
