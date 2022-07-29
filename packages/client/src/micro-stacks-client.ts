import type {
  FinishedTxData,
  Profile,
  SignatureData,
  SignedOptionsWithOnHandlers,
  StacksProvider,
  StacksSessionState,
} from 'micro-stacks/connect';
import {
  authenticate,
  handleSignMessageRequest,
  handleSignStructuredDataRequest,
  makeContractCallToken,
  makeContractDeployToken,
  makeStxTransferToken,
  openTransactionPopup,
} from 'micro-stacks/connect';
import type { StacksNetwork } from 'micro-stacks/network';
import { ChainID, StacksMainnet, StacksTestnet } from 'micro-stacks/network';
import type { Mutate, StoreApi } from 'zustand/vanilla';
import { default as create } from 'zustand/vanilla';
import type { ClarityValue } from 'micro-stacks/clarity';
import type { ClientStorage } from './common/storage';
import { defaultStorage, noopStorage } from './common/storage';
import type { ClientConfig, SignTransactionRequest, State } from './common/types';
import { DebugOptions } from './common/types';
import { persist, subscribeWithSelector } from 'zustand/middleware';
import { bytesToHex, fetchPrivate, getGlobalObject, hexToBytes } from 'micro-stacks/common';
import { invariantWithMessage } from './common/utils';
import { Status, StatusKeys, STORE_KEY, TxType } from './common/constants';
import {
  c32address,
  c32addressDecode,
  decryptContent,
  encryptContent,
  EncryptContentOptions,
  privateKeyToBase58Address,
  StacksNetworkVersion,
} from 'micro-stacks/crypto';
import { SignInWithStacksMessage } from './siwms';
import { generateGaiaHubConfigSync, getFile, putFile } from 'micro-stacks/storage';
import { defaultState, getDebugState, hydrate, serialize, VERSION } from './utils';
import { MicroStacksErrors } from './common/errors';

export class MicroStacksClient {
  config: ClientConfig;
  storage: ClientStorage;
  store: Mutate<
    StoreApi<State>,
    [['zustand/subscribeWithSelector', never], ['zustand/persist', State]]
  >;
  debug?: DebugOptions;
  fetcher: (input: RequestInfo, init?: RequestInit) => Promise<Response>;

  constructor(initConfig: ClientConfig = {}) {
    const config = {
      storage: initConfig?.storage ?? defaultStorage,
      network: initConfig?.network ?? new StacksMainnet(),
      ...initConfig,
    };

    const dehydratedState =
      typeof config.dehydratedState === 'function'
        ? config.dehydratedState(this.storeKey)
        : config.dehydratedState;

    const defaultStore = dehydratedState
      ? hydrate(dehydratedState, config)
      : {
          state: defaultState(config),
          version: VERSION,
        };

    // Create store
    this.store = create(
      subscribeWithSelector(
        persist<State, [['zustand/subscribeWithSelector', never]]>(() => defaultStore.state, {
          name: STORE_KEY,
          getStorage: () => config.storage,
          version: defaultStore.version,
          serialize: ({ state, version }) => serialize({ state, version: version ?? VERSION }),
          deserialize: str => hydrate(str, config),
        })
      )
    );
    this.debug = getDebugState();
    this.config = config;
    this.storage = config.storage;
    this.fetcher = config.fetcher || fetchPrivate;
  }

  getState = () => this.store.getState();

  private setState(updater: State | ((state: State) => State)) {
    const newState = typeof updater === 'function' ? updater(this.store.getState()) : updater;
    this.store.setState(newState, true);
  }

  private resetState() {
    this.setState(state => ({
      ...state,
      accounts: [],
      currentAccountIndex: 0,
    }));
  }

  get subscribe() {
    return this.store.subscribe;
  }

  private onStorageUpdate = (e: StorageEvent) => {
    if (typeof document !== 'undefined') {
      const currentUrl = window.location.host;
      const eventUrl = new URL(e.url).host;
      const isSame = currentUrl === eventUrl;
      const isClientStorage = e.key === 'micro-stacks.store';

      if (isSame && isClientStorage) {
        const stateToHydrate = e.newValue as string;
        this.hydrate(JSON.parse(stateToHydrate) as string);
      }
    }
  };

  tabSyncSubscription = (isEnabled?: boolean) => {
    const IS_BROWSER = typeof document !== 'undefined';
    if (IS_BROWSER && isEnabled) window.addEventListener('storage', this.onStorageUpdate);
    return () => {
      if (IS_BROWSER && isEnabled) window.removeEventListener('storage', this.onStorageUpdate);
    };
  };

  private getStacksProvider(): undefined | StacksProvider {
    return getGlobalObject('StacksProvider', { throwIfUnavailable: false });
  }

  subscribeToStacksProvider(callback: () => void, intervalMs = 100): () => void {
    if (!!this.getStacksProvider()) {
      callback();
      return () => {
        return;
      };
    } else {
      const id = setInterval(() => {
        const hasProvider = !!this.getStacksProvider();
        if (hasProvider) {
          callback();
          clearInterval(id);
        }
      }, intervalMs);

      return () => {
        if (typeof id !== 'undefined') clearInterval(id);
      };
    }
  }

  private get storeKey() {
    return STORE_KEY;
  }

  private onPersistState = (dehydratedState: string) => {
    return this.store.getState()?.onPersistState?.(dehydratedState);
  };

  private get onAuthentication() {
    return this.store.getState()?.onAuthentication;
  }

  private get onNoWalletFound() {
    return this.store.getState()?.onNoWalletFound;
  }

  private get onSignOut() {
    return this.store.getState()?.onSignOut;
  }

  setOnPersistState = (onPersistState: (dehydratedState: string) => void | Promise<void>) => {
    this.setState(s => ({
      ...s,
      onPersistState,
    }));
    this.config.onPersistState = onPersistState;
  };

  setOnNoWalletFound = (onNoWalletFound: () => void | Promise<void>) => {
    this.setState(s => ({
      ...s,
      onNoWalletFound,
    }));
    this.config.onPersistState = onNoWalletFound;
  };

  setOnSignOut = (onSignOut: ClientConfig['onSignOut']) => {
    this.setState(s => ({
      ...s,
      onSignOut,
    }));
    this.config.onSignOut = onSignOut;
  };

  setOnAuthentication = (onAuthentication: ClientConfig['onAuthentication']) => {
    this.setState(s => ({
      ...s,
      onAuthentication,
    }));
    this.config.onAuthentication = onAuthentication;
  };

  persist = async () => {
    if (this.onPersistState) {
      const dehydratedState = this.dehydrate(this.store.getState());
      await this.onPersistState(dehydratedState);
    }
  };

  dehydrate(state?: State) {
    return serialize({ state: state ?? this.store.getState(), version: VERSION });
  }

  hydrate(dehydratedState: string) {
    const store = hydrate(dehydratedState, this.config);
    this.setState(store.state);
  }

  /** ------------------------------------------------------------------------------------------------------------------
   *   Gaia config
   *  ------------------------------------------------------------------------------------------------------------------
   */

  getGaiaConfig = () => this.config.gaiaConfig;

  /** ------------------------------------------------------------------------------------------------------------------
   *   State selectors
   *  ------------------------------------------------------------------------------------------------------------------
   */

  selectHasSession = (state: State) => Boolean(state.accounts.length);
  selectAccounts = (state: State) => state.accounts;
  selectAccount = (state: State) =>
    this.selectHasSession(state) ? state.accounts[state.currentAccountIndex] : undefined;
  selectNetwork = (state: State) => state.network;
  selectNetworkChain = (state: State) =>
    state.network.chainId === ChainID.Mainnet ? 'mainnet' : 'testnet';
  selectTestnetStxAddress = (state: State) => {
    const account = this.selectAccount(state);
    return account
      ? c32address(
          account.address[0] === StacksNetworkVersion.mainnetP2SH
            ? StacksNetworkVersion.testnetP2SH
            : StacksNetworkVersion.testnetP2PKH,
          hexToBytes(account.address[1])
        )
      : undefined;
  };
  selectMainnetStxAddress = (state: State) => {
    const account = this.selectAccount(state);
    return account ? c32address(account.address[0], hexToBytes(account.address[1])) : undefined;
  };
  selectStxAddress = (state: State) =>
    this.selectNetworkChain(state) === 'mainnet'
      ? this.selectMainnetStxAddress(state)
      : this.selectTestnetStxAddress(state);
  selectAppDetails = (state: State) =>
    state.appName && state.appIconUrl
      ? {
          name: state.appName,
          icon: state.appIconUrl,
        }
      : undefined;
  selectIdentityAddress = (state: State) => {
    const account = this.selectAccount(state);
    return account?.appPrivateKey ? privateKeyToBase58Address(account.appPrivateKey) : undefined;
  };
  selectDecentralizedID = (state: State) => {
    const identityAddress = this.selectIdentityAddress(state);
    return identityAddress ? `did:btc-addr:${identityAddress}` : undefined;
  };
  selectStatuses = (state: State) => state.statuses;

  /** ------------------------------------------------------------------------------------------------------------------
   *   Statuses
   *  ------------------------------------------------------------------------------------------------------------------
   */

  setStatus(key: StatusKeys, status: Status) {
    this.setState(s => ({
      ...s,
      statuses: {
        ...s.statuses,
        [key]: status,
      },
    }));
  }

  setIsRequestPending(key: StatusKeys) {
    this.setStatus(key, Status.IsLoading);
  }

  setIsIdle(key: StatusKeys) {
    this.setStatus(key, Status.IsIdle);
  }

  statuses = () => {
    return this.selectStatuses(this.getState());
  };

  isSignMessageRequestPending = () => {
    return this.statuses()[StatusKeys.MessageSigning];
  };

  isSignStructuredMessageRequestPending = () => {
    return this.statuses()[StatusKeys.StructuredMessageSigning];
  };

  handleNoStacksProviderFound() {
    if (typeof this.getStacksProvider() === 'undefined') {
      if (typeof this.onNoWalletFound !== 'undefined') {
        void this.onNoWalletFound();
        return false;
      }
      invariantWithMessage(this.getStacksProvider(), MicroStacksErrors.StacksProviderNotFund);
      return false;
    }
    return true;
  }

  /** ------------------------------------------------------------------------------------------------------------------
   *   Authenticate
   *
   *   This is the main method for authenticating users from a StacksProvider. Providers are injected via a web ext
   *   or in the case of something like Xverse, polyfilled to mirror the way the Hiro Web Wallet injects the provider.
   *
   *   This method can take two callbacks as direct params: onFinish and onCancel. These will run in addition to the
   *   following callbacks (if they have been set prior to authentication): client.onAuthentication and
   *   client.onPersistState.
   *
   *   Requires: `StacksProvider` and `config.appDetails`
   *
   *  ------------------------------------------------------------------------------------------------------------------
   */

  authenticate = async (params?: {
    onFinish?: (session: Omit<StacksSessionState, 'profile'>) => void;
    onCancel?: (error?: Error) => void;
  }) => {
    if (!this.handleNoStacksProviderFound()) return;

    // first we need to make sure these are available
    const appDetails = this.selectAppDetails(this.getState());
    invariantWithMessage(appDetails, MicroStacksErrors.AppDetailsNotDefined);

    const accounts = this.selectAccounts(this.getState());

    // now we set pending status
    this.setIsRequestPending(StatusKeys.Authentication);

    // authenticate request to the provider
    await authenticate(
      {
        appDetails: appDetails,
        // this is the on success callback
        onFinish: async ({ profile, ...session }) => {
          const [version, bytes] = c32addressDecode(session.addresses.mainnet);

          const address: [number, string] = [version, bytesToHex(bytes)];

          const hasAccount = accounts.find(account => account.address === address);
          // if this is not currently saved, we should save it
          if (!hasAccount) {
            this.setState(state => ({
              ...state,
              accounts: state.accounts.concat({
                address,
                appPrivateKey: this.debug?.disableAppPrivateKey ? undefined : session.appPrivateKey,
                decentralizedID: session.decentralizedID,
                profile_url: session.profile_url,
              }),
              currentAccountIndex: state.accounts.length,
            }));
          } else {
            // else just switch to the index
            this.setState(s => ({
              ...s,
              currentAccountIndex: accounts.findIndex(account => account.address === address),
            }));
          }
          // fire any of our callbacks
          params?.onFinish?.(session);
          this.onAuthentication?.({ profile, ...session });
          await this.persist();

          // set pending to idle
          this.setIsIdle(StatusKeys.Authentication);
        },
        onCancel: error => {
          // set pending to idle
          this.setIsIdle(StatusKeys.Authentication);
          // fire the onCancel if exists
          params?.onCancel?.(error);
        },
      },
      noopStorage
    );
  };

  signOut = async (onSignOut?: (() => void) | (() => Promise<void>)) => {
    this.store?.persist?.clearStorage?.();
    this.onSignOut?.();
    this.resetState();
    return onSignOut?.();
  };

  /** ------------------------------------------------------------------------------------------------------------------
   *   Sign in with Stacks
   *  ------------------------------------------------------------------------------------------------------------------
   */

  getSignInMessage = ({
    domain,
    nonce,
    version = '1.0.0',
  }: {
    domain?: string;
    nonce: string;
    version?: string;
  }) => {
    if (!this.handleNoStacksProviderFound()) return;

    const state = this.getState();
    const appDetails = this.selectAppDetails(state);
    const stxAddress = this.selectStxAddress(state);

    invariantWithMessage(appDetails, MicroStacksErrors.AppDetailsNotDefined);
    invariantWithMessage(stxAddress, MicroStacksErrors.StxAddressNotAvailable);

    const fallbackUri = getGlobalObject('document', { throwIfUnavailable: false })
      ? window.location.origin
      : '';

    return new SignInWithStacksMessage({
      domain: appDetails.name,
      address: stxAddress,
      statement: 'Sign in with Stacks',
      uri: domain ?? fallbackUri,
      version,
      chainId: ChainID.Mainnet,
      nonce,
    });
  };

  /** ------------------------------------------------------------------------------------------------------------------
   *   Sign transactions
   *  ------------------------------------------------------------------------------------------------------------------
   */

  signTransaction: SignTransactionRequest = async (type, params) => {
    if (!this.handleNoStacksProviderFound()) return;

    const state = this.getState();
    const appDetails = this.selectAppDetails(state);
    const stxAddress = this.selectStxAddress(state);
    const account = this.selectAccount(state);
    const network = this.selectNetwork(state);

    invariantWithMessage(appDetails, MicroStacksErrors.AppDetailsNotDefined);
    invariantWithMessage(stxAddress, MicroStacksErrors.StxAddressNotAvailable);
    invariantWithMessage(account, MicroStacksErrors.NoSession);

    this.setIsRequestPending(StatusKeys.TransactionSigning);

    let result: FinishedTxData | undefined;

    const sharedParams = {
      privateKey: account.appPrivateKey,
      appDetails,
      stxAddress,
      network,
      postConditionMode: params.postConditionMode,
      postConditions: params.postConditions,
      attachment: params.attachment,
      sponsored: params.sponsored,
    };

    const fn =
      type === TxType.TokenTransfer
        ? makeStxTransferToken
        : type === TxType.ContractCall
        ? makeContractCallToken
        : makeContractDeployToken;

    // todo: types would be great
    const token = await fn({ ...sharedParams, ...params } as any);

    invariantWithMessage(token, MicroStacksErrors.JWTCouldNotBeMade);

    await openTransactionPopup({
      token,
      onFinish: payload => {
        result = payload;
        params?.onFinish?.(payload);
        this.setIsIdle(StatusKeys.TransactionSigning);
      },
      onCancel: error => {
        params?.onCancel?.(error);
        this.setIsIdle(StatusKeys.TransactionSigning);
      },
    });

    return result;
  };

  /** ------------------------------------------------------------------------------------------------------------------
   *   Sign message
   *  ------------------------------------------------------------------------------------------------------------------
   */

  signMessage = async (params: SignedOptionsWithOnHandlers<{ message: string }>) => {
    if (!this.handleNoStacksProviderFound()) return;

    const state = this.getState();
    const appDetails = this.selectAppDetails(state);
    const stxAddress = this.selectStxAddress(state);
    const account = this.selectAccount(state);
    const network = this.selectNetwork(state);
    invariantWithMessage(appDetails, MicroStacksErrors.AppDetailsNotDefined);
    invariantWithMessage(stxAddress, MicroStacksErrors.StxAddressNotAvailable);
    invariantWithMessage(account, MicroStacksErrors.NoSession);
    invariantWithMessage(params.message, MicroStacksErrors.NoMessagePassedToSignMessage);

    this.setIsRequestPending(StatusKeys.MessageSigning);
    let result: SignatureData | undefined;

    await handleSignMessageRequest({
      appDetails: appDetails,
      privateKey: account.appPrivateKey,
      stxAddress: stxAddress,
      network,
      message: params.message,
      onFinish: payload => {
        result = payload;
        params?.onFinish?.(payload);
        this.setIsIdle(StatusKeys.MessageSigning);
      },
      onCancel: errorMessage => {
        params?.onCancel?.(errorMessage);
        this.setIsIdle(StatusKeys.MessageSigning);
      },
    });

    return result;
  };

  /** ------------------------------------------------------------------------------------------------------------------
   *   Sign structured message
   *  ------------------------------------------------------------------------------------------------------------------
   */

  signStructuredMessage = async (
    params: SignedOptionsWithOnHandlers<{
      message: string | ClarityValue;
      domain?: {
        name?: string;
        version?: string;
        chainId?: ChainID;
      };
    }>
  ) => {
    if (!this.handleNoStacksProviderFound()) return;

    const state = this.getState();
    const appDetails = this.selectAppDetails(state);
    const stxAddress = this.selectStxAddress(state);
    const account = this.selectAccount(state);
    const network = this.selectNetwork(state);
    invariantWithMessage(appDetails, MicroStacksErrors.AppDetailsNotDefined);
    invariantWithMessage(stxAddress, MicroStacksErrors.StxAddressNotAvailable);
    invariantWithMessage(account, MicroStacksErrors.NoSession);
    invariantWithMessage(params.message, MicroStacksErrors.NoMessagePassedToSignMessage);

    this.setIsRequestPending(StatusKeys.StructuredMessageSigning);
    let result: SignatureData | undefined;

    await handleSignStructuredDataRequest({
      appDetails: appDetails,
      privateKey: account.appPrivateKey,
      stxAddress: stxAddress,
      network,
      domain: {
        name: params.domain?.name ?? appDetails.name,
        version: params.domain?.version ?? '1.0.0',
        chainId: params.domain?.chainId ?? network.chainId,
      },
      message: params.message,
      onFinish: payload => {
        result = payload;
        params?.onFinish?.(payload);
        this.setIsIdle(StatusKeys.StructuredMessageSigning);
      },
      onCancel: errorMessage => {
        params?.onCancel?.(errorMessage);
        this.setIsIdle(StatusKeys.StructuredMessageSigning);
      },
    });

    return result;
  };

  /** ------------------------------------------------------------------------------------------------------------------
   *   Set network
   *  ------------------------------------------------------------------------------------------------------------------
   */
  setNetwork = (network: 'mainnet' | 'testnet' | StacksNetwork) => {
    if (typeof network === 'string')
      this.setState(s => ({
        ...s,
        network: network === 'mainnet' ? new StacksMainnet() : new StacksTestnet(),
      }));
    else this.setState(s => ({ ...s, network }));
    void this.persist();
  };

  /** ------------------------------------------------------------------------------------------------------------------
   *   Storage
   *  ------------------------------------------------------------------------------------------------------------------
   */

  selectGaiaHubConfig(state: State) {
    const hasSession = this.selectHasSession(state);
    const account = this.selectAccount(state);
    if (!hasSession || !account?.appPrivateKey) return;
    return generateGaiaHubConfigSync({
      gaiaHubUrl: 'https://hub.blockstack.org',
      privateKey: account.appPrivateKey,
    });
  }

  putFile = (
    path: string,
    contents: string | Uint8Array | ArrayBufferView | Blob,
    { encrypt = true, sign }: { encrypt?: boolean; sign?: boolean }
  ) => {
    const hasSession = this.selectHasSession(this.getState());
    const gaiaHubConfig = this.selectGaiaHubConfig(this.getState());
    const account = this.selectAccount(this.getState());
    if (!hasSession) {
      console.warn(MicroStacksErrors.NoSession);
      return;
    }
    if (!account?.appPrivateKey || !gaiaHubConfig) {
      console.warn(MicroStacksErrors.NoAppPrivateKey);
      return;
    }
    return putFile(path, contents, {
      privateKey: account.appPrivateKey,
      gaiaHubConfig,
      encrypt,
      sign,
      wasString: typeof contents === 'string',
    });
  };

  getFile = (path: string, { decrypt = true, verify }: { decrypt?: boolean; verify?: boolean }) => {
    const hasSession = this.selectHasSession(this.getState());
    const gaiaHubConfig = this.selectGaiaHubConfig(this.getState());
    const account = this.selectAccount(this.getState());
    if (!hasSession) {
      console.warn(MicroStacksErrors.NoSession);
      return;
    }
    if (!account?.appPrivateKey || !gaiaHubConfig) {
      console.warn(MicroStacksErrors.NoAppPrivateKey);
      return;
    }

    return getFile(path, {
      privateKey: account.appPrivateKey,
      gaiaHubConfig,
      decrypt,
      verify,
    });
  };

  /** ------------------------------------------------------------------------------------------------------------------
   *   Fetchers
   *  ------------------------------------------------------------------------------------------------------------------
   */

  async fetchBNSName(): Promise<string | undefined> {
    const stxAddress = this.selectStxAddress(this.getState());
    const network = this.selectNetwork(this.getState());
    if (!stxAddress) {
      console.warn('No Stacks address found while trying to fetch BNS name');
      return undefined;
    }
    const path = network.getCoreApiUrl() + `/v1/addresses/stacks/${stxAddress}`;
    try {
      const res = await this.fetcher(path);
      const json: { names?: string[] } = await res.json();
      return json?.names?.[0];
    } catch (e) {
      console.log('[@micro-stacks/client] fetchBNSName failed', e);
    }
    return undefined;
  }

  async fetchZoneFile(): Promise<any> {
    try {
      const stxAddress = this.selectStxAddress(this.getState());
      const network = this.selectNetwork(this.getState());
      if (!stxAddress) {
        console.warn('No Stacks address found while trying to fetch zonefile name');
        return undefined;
      }
      const path = network.getCoreApiUrl() + `/v1/names/${stxAddress}/zonefile`;
      const res = await this.fetcher(path);
      const payload = await res.json();
      return payload as { zonefile: string; address: string };
    } catch (e) {
      console.log('[@micro-stacks/client] fetchZoneFile failed', e);
    }
    return undefined;
  }

  async fetchProfile(): Promise<Profile | undefined> {
    const account = this.selectAccount(this.getState());
    if (!account?.profile_url) return undefined;
    try {
      const res = await this.fetcher(account.profile_url);
      const json = await res.json();
      return json as Profile;
    } catch (e) {
      console.log('[@micro-stacks/client] fetchProfile failed', e);
    }
    return undefined;
  }

  /** ------------------------------------------------------------------------------------------------------------------
   *   Encryption
   *  ------------------------------------------------------------------------------------------------------------------
   */

  encrypt(content: string | Uint8Array, options: EncryptContentOptions = {}) {
    if (options?.publicKey && options?.privateKey)
      throw Error('Error: do not pass both `publicKey` and `privateKey` to client.encrypt');

    return encryptContent(content, {
      ...options,
      privateKey: options.privateKey ?? this.selectAccount(this.getState())?.appPrivateKey,
    });
  }

  decrypt(
    content: string,
    options: {
      privateKey: string;
    }
  ) {
    const privateKey = options.privateKey ?? this.selectAccount(this.getState())?.appPrivateKey;
    if (!privateKey) throw Error('You must pass a `privateKey` value to client.decrypt');

    return decryptContent(content, {
      privateKey,
    });
  }
}
