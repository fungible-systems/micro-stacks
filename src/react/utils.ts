import { StacksMainnet, StacksMocknet, StacksTestnet } from 'micro-stacks/network';
import { NetworkType } from './types';

export function getNetwork(network?: NetworkType) {
  if (!network) return new StacksMainnet();
  switch (network) {
    case 'mocknet':
      return new StacksMocknet();
    case 'testnet':
      return new StacksTestnet();
    case 'mainnet':
      return new StacksMainnet();
    default:
      return network;
  }
}

export enum MicroStacksProviderAtoms {
  AuthOptions = 'authOptions',
  StorageAdapter = 'storageAdapter',
  Network = 'network',
  PartialStacksSession = 'partialStacksSession',
  EnableCookies = 'useCookies',
  IsSignedIn = 'isSignedIn',
}

export function cookies() {
  const doc = typeof document === 'undefined' ? { cookie: '' } : document;

  function get(key: string) {
    const splat = doc.cookie.split(/;\s*/);
    for (let i = 0; i < splat.length; i++) {
      const ps = splat[i].split('=');
      const k = unescape(ps[0]);
      if (k === key) return unescape(ps[1]);
    }
    return undefined;
  }

  function set(key: string, value: string, opts?: any) {
    if (!opts) opts = {};
    let s = escape(key) + '=' + escape(value);
    if (opts.expires) s += '; expires=' + opts.expires;
    // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
    if (opts.path) s += '; path=' + escape(opts.path);
    // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
    if (opts.domain) s += '; domain=' + escape(opts.domain);
    if (opts.secure) s += '; secure';
    doc.cookie = s;
    return s;
  }

  return {
    set,
    get,
  };
}
