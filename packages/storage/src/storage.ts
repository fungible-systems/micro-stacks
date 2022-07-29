import { MicroStacksClient } from '@micro-stacks/client';
import { getFile, putFile, generateGaiaHubConfig, GaiaHubConfig } from 'micro-stacks/storage';
import { deleteFromGaiaHub, fetchWithEtagCache, listFiles } from './utils';

const DEFAULT_GAIA_HUB_URL = 'https://hub.blockstack.org';
const DEFAULT_GAIA_READER_URL = 'https://gaia.blockstack.org/hub/';
const cacheMap = new Map<string, any>();

export interface GaiaConfig {
  gaiaHubUrl?: string;
  gaiaReadUrl?: string;
  gaiaHubConfig?: GaiaHubConfig;
  privateKey?: string;
}

export class Storage {
  /** ------------------------------------------------------------------------------------------------------------------
   *  Constructor
   *  ------------------------------------------------------------------------------------------------------------------
   */
  constructor(options: {
    client?: MicroStacksClient;
    gaiaConfig?: GaiaConfig;
    disableEtagCache?: boolean;
  }) {
    // if nothing is passed
    if (!options.gaiaConfig && !options.client)
      throw Error(
        'There needs to be either an instance of Client or custom Gaia Hub Config params passed'
      );

    if (options.gaiaConfig && options.client)
      throw Error(
        'Both client and configurations for gaia have been passed, only pass one of them'
      );

    if (options?.client) {
      this.client = options.client;
      const gaiaConfig = this.client.getGaiaConfig();
      if (gaiaConfig) this.gaiaConfig = gaiaConfig;
    } else if (options.gaiaConfig) {
      this.gaiaConfig = options.gaiaConfig;
    }

    this._cache = cacheMap;

    const useEtagFetcher = typeof document !== 'undefined' && !options.disableEtagCache;
    const etagFetcher = async (input: RequestInfo, init?: RequestInit) =>
      fetchWithEtagCache(input, init, this.cache);

    this.fetcher = useEtagFetcher ? etagFetcher : options.client?.fetcher ?? fetch;
  }

  /** ------------------------------------------------------------------------------------------------------------------
   *   Misc
   *  ------------------------------------------------------------------------------------------------------------------
   */

  private client?: MicroStacksClient;
  private fetcher?: (input: RequestInfo, init?: RequestInit) => Promise<Response>;

  /** ------------------------------------------------------------------------------------------------------------------
   *   Cache
   *  ------------------------------------------------------------------------------------------------------------------
   */
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
  private getCache = (key: string) => this.cache().get(key);
  private setCache = <T>(key: string, value: T) => this.cache().set(key, value);

  /** ------------------------------------------------------------------------------------------------------------------
   *   Gaia config
   *  ------------------------------------------------------------------------------------------------------------------
   */

  private readonly gaiaConfig?: GaiaConfig;

  private getPrivateKey = () => {
    if (this.gaiaConfig?.privateKey) return this.gaiaConfig.privateKey;
    const appPrivateKey = this.client?.selectAccount?.(this.client?.getState?.())?.appPrivateKey;
    if (!appPrivateKey) throw Error('No app private key found');
    return appPrivateKey;
  };

  private getGaiaHubConfig = async (privateKey: string): Promise<GaiaHubConfig> => {
    if (this.gaiaConfig?.gaiaHubConfig) return this.gaiaConfig.gaiaHubConfig;

    const opts = {
      gaiaHubUrl: this.gaiaConfig?.gaiaHubUrl ?? DEFAULT_GAIA_HUB_URL,
      gaiaReaderUrl: this.gaiaConfig?.gaiaReadUrl ?? DEFAULT_GAIA_READER_URL,
      privateKey,
    };
    const key = `${JSON.stringify([opts.gaiaHubUrl, opts.gaiaHubUrl])}_GaiaHubConfig`;

    const cached = this.getCache(key);

    if (cached) return JSON.parse(cached);

    const gaiaHubConfig = await generateGaiaHubConfig(opts, {
      fetcher: this.fetcher,
      fetchHubInfo: true,
    });

    this.setCache(key, JSON.stringify(gaiaHubConfig));

    return gaiaHubConfig;
  };

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
