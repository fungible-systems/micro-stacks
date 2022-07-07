import { ChainID, fetchPrivate, TransactionVersion } from 'micro-stacks/common';

type Fetcher = (input: RequestInfo, init?: RequestInit) => Promise<Response>;

export const HIRO_MAINNET_DEFAULT = 'https://stacks-node-api.mainnet.stacks.co';
export const HIRO_TESTNET_DEFAULT = 'https://stacks-node-api.testnet.stacks.co';
export const HIRO_MOCKNET_DEFAULT = 'http://localhost:3999';

export interface NetworkConfig {
  // TODO: deprecate
  url?: string;
  coreApiUrl?: string;
  bnsLookupUrl?: string;
  fetcher?: Fetcher;
}

export interface StacksNetwork {
  version: TransactionVersion;
  chainId: ChainID;
  bnsLookupUrl: string;
  broadcastEndpoint: string;
  transferFeeEstimateEndpoint: string;
  accountEndpoint: string;
  contractAbiEndpoint: string;
  readOnlyFunctionCallEndpoint: string;

  isMainnet(): boolean;

  getBroadcastApiUrl: () => string;
  getTransferFeeEstimateApiUrl: () => string;
  getAccountApiUrl: (address: string) => string;
  getAbiApiUrl: (address: string, contract: string) => string;
  getReadOnlyFunctionCallApiUrl: (
    contractAddress: string,
    contractName: string,
    functionName: string
  ) => string;
  getCoreApiUrl: () => string;
  getInfoUrl: () => string;
  getBlockTimeInfoUrl: () => string;
  getPoxInfoUrl: () => string;
  getRewardsUrl: (address: string, options?: any) => string;
  getRewardHoldersUrl: (address: string, options?: any) => string;
  getRewardsTotalUrl: (address: string) => string;
  getStackerInfoUrl: (contractAddress: string, contractName: string) => string;

  /**
   * Get WHOIS-like information for a name, including the address that owns it,
   * the block at which it expires, and the zone file anchored to it (if available).
   *
   * This is intended for use in third-party wallets or in DApps that register names.
   * @param fullyQualifiedName the name to query.  Can be on-chain of off-chain.
   * @return a promise that resolves to the WHOIS-like information
   */
  getNameInfo: (fullyQualifiedName: string) => any;
}

export class StacksMainnet implements StacksNetwork {
  version = TransactionVersion.Mainnet;
  chainId = ChainID.Mainnet;
  broadcastEndpoint = '/v2/transactions';
  transferFeeEstimateEndpoint = '/v2/fees/transfer';
  accountEndpoint = '/v2/accounts';
  contractAbiEndpoint = '/v2/contracts/interface';
  readOnlyFunctionCallEndpoint = '/v2/contracts/call-read';
  bnsLookupUrl: string;
  private _coreApiUrl: string;
  private fetcher: Fetcher;

  get coreApiUrl() {
    return this._coreApiUrl;
  }

  set coreApiUrl(_url: string) {
    throw new Error('Cannot modify property `coreApiUrl` after object initialization');
  }

  constructor(networkConfig: NetworkConfig = { url: HIRO_MAINNET_DEFAULT }) {
    if (!networkConfig.url && !networkConfig.coreApiUrl)
      throw Error('[miro-stacks] Network initialized with no api url');
    this._coreApiUrl = (networkConfig.url || networkConfig.coreApiUrl) as string;
    this.bnsLookupUrl = (networkConfig.bnsLookupUrl ||
      networkConfig.url ||
      networkConfig.coreApiUrl) as string;
    this.fetcher = networkConfig.fetcher || fetchPrivate;
  }

  getCoreApiUrl = () => this._coreApiUrl;
  isMainnet = () => this.version === TransactionVersion.Mainnet;
  getBroadcastApiUrl = () => `${this.getCoreApiUrl()}${this.broadcastEndpoint}`;
  getTransferFeeEstimateApiUrl = () => `${this.getCoreApiUrl()}${this.transferFeeEstimateEndpoint}`;
  getAccountApiUrl = (address: string) =>
    `${this.getCoreApiUrl()}${this.accountEndpoint}/${address}?proof=0`;
  getAbiApiUrl = (address: string, contract: string) =>
    `${this.getCoreApiUrl()}${this.contractAbiEndpoint}/${address}/${contract}`;
  getReadOnlyFunctionCallApiUrl = (
    contractAddress: string,
    contractName: string,
    functionName: string
  ) =>
    `${this.getCoreApiUrl()}${
      this.readOnlyFunctionCallEndpoint
    }/${contractAddress}/${contractName}/${encodeURIComponent(functionName)}`;
  getInfoUrl = () => `${this.getCoreApiUrl()}/v2/info`;
  getBlockTimeInfoUrl = () => `${this.getCoreApiUrl()}/extended/v1/info/network_block_times`;
  getPoxInfoUrl = () => `${this.getCoreApiUrl()}/v2/pox`;
  getRewardsUrl = (address: string, options?: any) => {
    let url = `${this.getCoreApiUrl()}/extended/v1/burnchain/rewards/${address}`;
    if (options) {
      url = `${url}?limit=${options.limit}&offset=${options.offset}`;
    }
    return url;
  };
  getRewardsTotalUrl = (address: string) =>
    `${this.getCoreApiUrl()}/extended/v1/burnchain/rewards/${address}/total`;
  getRewardHoldersUrl = (address: string, options?: any) => {
    let url = `${this.getCoreApiUrl()}/extended/v1/burnchain/reward_slot_holders/${address}`;
    if (options) {
      url = `${url}?limit=${options.limit}&offset=${options.offset}`;
    }
    return url;
  };
  getStackerInfoUrl = (contractAddress: string, contractName: string) =>
    `${this.getCoreApiUrl()}${this.readOnlyFunctionCallEndpoint}
    ${contractAddress}/${contractName}/get-stacker-info`;

  getNameInfo(fullyQualifiedName: string) {
    /*
      TODO: Update to v2 API URL for name lookups
    */
    const nameLookupURL = `${this.bnsLookupUrl}/v1/names/${fullyQualifiedName}`;
    return this.fetcher(nameLookupURL)
      .then(resp => {
        if (resp.status === 404) {
          throw new Error('Name not found');
        } else if (resp.status !== 200) {
          throw new Error(`Bad response status: ${resp.status}`);
        } else {
          return resp.json();
        }
      })
      .then(nameInfo => {
        // the returned address _should_ be in the correct network ---
        //  blockstackd gets into trouble because it tries to coerce back to mainnet
        //  and the regtest transaction generation libraries want to use testnet addresses
        if (nameInfo.address) {
          return Object.assign({}, nameInfo, { address: nameInfo.address });
        } else {
          return nameInfo;
        }
      });
  }
}

export class StacksTestnet extends StacksMainnet implements StacksNetwork {
  version = TransactionVersion.Testnet;
  chainId = ChainID.Testnet;

  constructor(networkConfig: NetworkConfig = { url: HIRO_TESTNET_DEFAULT, fetcher: fetchPrivate }) {
    super(networkConfig);
  }
}

export class StacksMocknet extends StacksMainnet implements StacksNetwork {
  version = TransactionVersion.Testnet;
  chainId = ChainID.Testnet;

  constructor(networkConfig: NetworkConfig = { url: HIRO_MOCKNET_DEFAULT, fetcher: fetchPrivate }) {
    super(networkConfig);
  }
}

export { ChainID, TransactionVersion };
