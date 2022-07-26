import { MicroStacksClient } from '@micro-stacks/client';
import { getFile, putFile, generateGaiaHubConfig, GaiaHubConfig } from 'micro-stacks/storage';
import { deleteFromGaiaHub, fetchWithEtagCache, listFiles } from './utils';
const cacheMap = new Map<string, any>();
export class Storage {
  private client?: MicroStacksClient;
  private readonly gaiaHubUrl: string = 'https://hub.blockstack.org';
  private readonly privateKey?: string;
  private fetcher?: (input: RequestInfo, init?: RequestInit) => Promise<Response>;
  private _cache: Map<string, any>;
  private cache = () => ({
    get: (key: string) => {
      return this._cache.get(key);
    },
    set: (key: string, value: any) => {
      return this._cache.set(key, value);
    },
    remove: (key: string) => {
      this._cache.delete(key);
    },
  });

  private getPrivateKey = () => {
    return this.client
      ? this.client.selectAccount(this.client.getState())?.appPrivateKey
      : this.privateKey;
  };

  private getCache = (key: string) => this.cache().get(key);
  private setCache = <T>(key: string, value: T) => this.cache().set(key, value);

  private getGaiaHubConfig = async (privateKey: string): Promise<GaiaHubConfig> => {
    const cached = this.getCache(`${this.gaiaHubUrl}_GaiaHubConfig`);
    if (cached) return JSON.parse(cached);

    const gaiaHubConfig = await generateGaiaHubConfig(
      {
        gaiaHubUrl: this.gaiaHubUrl,
        privateKey,
      },
      {
        fetcher: this.fetcher,
        fetchHubInfo: true,
      }
    );

    this.setCache(`${this.gaiaHubUrl}_GaiaHubConfig`, JSON.stringify(gaiaHubConfig));

    return gaiaHubConfig;
  };

  constructor(options: {
    client: MicroStacksClient;
    gaiaHubUrl?: string;
    privateKey?: string;
    disableEtagCache?: boolean;
  }) {
    if (!options.client && !options.privateKey) throw Error('Need one');
    if (options.client && options.privateKey) throw Error('should not have both');

    if (options?.client) this.client = options.client;
    if (options?.gaiaHubUrl) this.gaiaHubUrl = options.gaiaHubUrl;
    if (options?.privateKey) this.privateKey = options.privateKey;

    this._cache = cacheMap;

    this.fetcher =
      typeof document !== 'undefined' && !options.disableEtagCache
        ? async (input, init) => fetchWithEtagCache(input, init, this.cache)
        : fetch;
  }

  /** ------------------------------------------------------------------------------------------------------------------
   *   Put file
   *  ------------------------------------------------------------------------------------------------------------------
   */

  putFile = async (
    path: string,
    contents: string | Uint8Array | ArrayBufferView | Blob,
    { encrypt = true, sign }: { encrypt?: boolean; sign?: boolean }
  ) => {
    const privateKey = this.getPrivateKey();
    if (!privateKey) throw Error('no priv key');
    const gaiaHubConfig = await this.getGaiaHubConfig(privateKey);

    return putFile(path, contents, {
      privateKey,
      gaiaHubConfig,
      encrypt,
      sign,
      wasString: typeof contents === 'string',
      fetcher: this.fetcher,
    });
  };

  /** ------------------------------------------------------------------------------------------------------------------
   *   Get file
   *  ------------------------------------------------------------------------------------------------------------------
   */

  getFile = async (
    path: string,
    { decrypt = true, verify }: { decrypt?: boolean; verify?: boolean }
  ) => {
    const privateKey = this.getPrivateKey();
    if (!privateKey) throw Error('no priv key');
    const gaiaHubConfig = await this.getGaiaHubConfig(privateKey);

    return getFile(path, {
      privateKey,
      gaiaHubConfig,
      decrypt,
      verify,
      fetcher: this.fetcher,
    });
  };

  /** ------------------------------------------------------------------------------------------------------------------
   *   List files
   *  ------------------------------------------------------------------------------------------------------------------
   */

  listFiles = async ({ prefix, pageToken }: { prefix?: string; pageToken?: string } = {}) => {
    const privateKey = this.getPrivateKey();
    if (!privateKey) throw Error('no priv key');
    const gaiaHubConfig = await this.getGaiaHubConfig(privateKey);
    return listFiles({ gaiaHubConfig, prefix, pageToken, fetcher: this.fetcher });
  };

  /** ------------------------------------------------------------------------------------------------------------------
   *   Delete files
   *  ------------------------------------------------------------------------------------------------------------------
   */
  deleteFile = async (path: string) => {
    const privateKey = this.getPrivateKey();
    if (!privateKey) throw Error('no priv key');
    const gaiaHubConfig = await this.getGaiaHubConfig(privateKey);
    return deleteFromGaiaHub(path, gaiaHubConfig, this.fetcher);
  };
}
