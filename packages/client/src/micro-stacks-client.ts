import type {
  FinishedTxData,
  Profile,
  SignatureData,
  SignedOptionsWithOnHandlers,
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
import { fetchPrivate, getGlobalObject } from 'micro-stacks/common';
import { invariantWithMessage } from './common/utils';
import { Status, StatusKeys, STORE_KEY, TxType } from './common/constants';
import {
  c32address,
  c32addressDecode,
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
    [['zustand/subscribeWithSelector', never], ['zustand/persist', Partial<State>]]
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

  private setState(updater: State | ((state: State) => State)) {
    const newState = typeof updater === 'function' ? updater(this.store.getState()) : updater;
    this.store.setState(newState, true);
  }

  private resetState() {
    this.setState(defaultState(this.config));
  }

  get subscribe() {
    return this.store.subscribe;
  }

  private get provider() {
    return getGlobalObject('StacksProvider');
  }

  private get storeKey() {
    return STORE_KEY;
  }

  private onPersistState = (str: string) => {
    return this.store.getState()?.onPersistState?.(str);
  };

  private get onAuthentication() {
    return this.store.getState()?.onAuthentication;
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

  private handleOnPersistState = () => {
    // persist state on changes
    if (this.onPersistState) this.onPersistState(this.dehydrate(this.store.getState()));
  };

  dehydrate(state?: State) {
    return serialize({ state: state ?? this.store.getState(), version: VERSION });
  }

  hydrate(dehydratedState: string) {
    const store = hydrate(dehydratedState, this.config);
    this.setState(store.state);
  }

  /** ------------------------------------------------------------------------------------------------------------------
   *   Session details
   *  ------------------------------------------------------------------------------------------------------------------
   */

  get hasSession() {
    return Boolean(this.accounts.length > 0);
  }

  get accounts() {
    return this.store.getState().accounts ?? [];
  }

  get currentAccountIndex() {
    return this.store.getState().currentAccountIndex ?? 0;
  }

  get account() {
    return this.accounts[this.currentAccountIndex];
  }

  get network(): StacksNetwork {
    return this.store.getState().network ?? new StacksMainnet();
  }

  get networkChain(): 'testnet' | 'mainnet' {
    return this.network.chainId === ChainID.Mainnet ? 'mainnet' : 'testnet';
  }

  get testnetStxAddress() {
    if (!this.account) return null;
    const [version, hash] = this.account.address;
    return c32address(
      version === StacksNetworkVersion.mainnetP2SH
        ? StacksNetworkVersion.testnetP2SH
        : StacksNetworkVersion.testnetP2PKH,
      hash
    );
  }

  get mainnetStxAddress() {
    if (!this.account) return null;
    const [version, hash] = this.account.address;
    return c32address(version, hash);
  }

  get stxAddress(): string | null {
    if (!this.account) return null;
    if (this.networkChain === 'testnet') return this.testnetStxAddress;
    return this.mainnetStxAddress;
  }

  get appDetails(): undefined | { name: string; icon: string } {
    const state = this.store.getState();
    if (!state.appName || !state.appIconUrl) return;
    return {
      name: state.appName as string,
      icon: state.appIconUrl as string,
    };
  }

  get identityAddress(): string | undefined {
    if (!this.hasSession || !this.account?.appPrivateKey) return undefined;
    return privateKeyToBase58Address(this.account.appPrivateKey);
  }

  get decentralizedID(): string | undefined {
    if (!this.identityAddress) return undefined;
    return `did:btc-addr:${this.identityAddress}`;
  }

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

  get statuses() {
    return this.store.getState().statuses;
  }

  get isSignMessageRequestPending() {
    return this.statuses[StatusKeys.MessageSigning];
  }

  get isSignStructuredMessageRequestPending() {
    return this.statuses[StatusKeys.StructuredMessageSigning];
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
    // first we need to make sure these are available
    invariantWithMessage(!!this.provider, MicroStacksErrors.StacksProviderNotFund);
    invariantWithMessage(this.appDetails, MicroStacksErrors.AppDetailsNotDefined);

    // now we set pending status
    this.setIsRequestPending(StatusKeys.Authentication);

    // authenticate request to the provider
    await authenticate(
      {
        appDetails: this.appDetails,
        // this is the on success callback
        onFinish: ({ profile, ...session }) => {
          const address = c32addressDecode(session.addresses.mainnet);

          const hasAccount = this.accounts.find(account => account.address === address);
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
              currentAccountIndex: this.accounts.findIndex(account => account.address === address),
            }));
          }
          // fire any of our callbacks
          params?.onFinish?.(session);
          this.onAuthentication?.({ profile, ...session });
          this.handleOnPersistState();

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
    invariantWithMessage(!!this.provider, MicroStacksErrors.StacksProviderNotFund);
    invariantWithMessage(this.appDetails, MicroStacksErrors.AppDetailsNotDefined);
    invariantWithMessage(this.stxAddress, MicroStacksErrors.StxAddressNotAvailable);

    const fallbackUri = getGlobalObject('document', { throwIfUnavailable: false })
      ? window.location.origin
      : '';

    return new SignInWithStacksMessage({
      domain: this.appDetails.name,
      address: this.stxAddress,
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
    invariantWithMessage(!!this.provider, MicroStacksErrors.StacksProviderNotFund);
    invariantWithMessage(this.appDetails, MicroStacksErrors.AppDetailsNotDefined);
    invariantWithMessage(this.stxAddress, MicroStacksErrors.StxAddressNotAvailable);
    invariantWithMessage(this.account, MicroStacksErrors.NoSession);

    this.setIsRequestPending(StatusKeys.TransactionSigning);

    let result: FinishedTxData | undefined;

    const sharedParams = {
      appDetails: this.appDetails,
      privateKey: this.account.appPrivateKey,
      stxAddress: this.stxAddress,
      network: this.network,
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
    invariantWithMessage(!!this.provider, MicroStacksErrors.StacksProviderNotFund);
    invariantWithMessage(this.appDetails, MicroStacksErrors.AppDetailsNotDefined);
    invariantWithMessage(this.stxAddress, MicroStacksErrors.StxAddressNotAvailable);
    invariantWithMessage(this.account, MicroStacksErrors.NoSession);
    invariantWithMessage(params.message, MicroStacksErrors.NoMessagePassedToSignMessage);

    this.setIsRequestPending(StatusKeys.MessageSigning);
    let result: SignatureData | undefined;

    await handleSignMessageRequest({
      appDetails: this.appDetails,
      privateKey: this.account.appPrivateKey,
      stxAddress: this.stxAddress,
      network: this.network,
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
    invariantWithMessage(!!this.provider, MicroStacksErrors.StacksProviderNotFund);
    invariantWithMessage(this.appDetails, MicroStacksErrors.AppDetailsNotDefined);
    invariantWithMessage(this.stxAddress, MicroStacksErrors.StxAddressNotAvailable);
    invariantWithMessage(this.account, MicroStacksErrors.NoSession);
    invariantWithMessage(params.message, MicroStacksErrors.NoMessagePassedToSignMessage);

    this.setIsRequestPending(StatusKeys.StructuredMessageSigning);
    let result: SignatureData | undefined;

    await handleSignStructuredDataRequest({
      appDetails: this.appDetails,
      privateKey: this.account.appPrivateKey,
      stxAddress: this.stxAddress,
      network: this.network,
      domain: {
        name: params.domain?.name ?? this.appDetails.name,
        version: params.domain?.version ?? '1.0.0',
        chainId: params.domain?.chainId ?? this.network.chainId,
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
    this.handleOnPersistState();
  };

  /** ------------------------------------------------------------------------------------------------------------------
   *   Storage
   *  ------------------------------------------------------------------------------------------------------------------
   */

  get gaiaHubConfig() {
    if (!this.hasSession || !this.account.appPrivateKey) return;
    return generateGaiaHubConfigSync({
      gaiaHubUrl: 'https://hub.blockstack.org',
      privateKey: this.account.appPrivateKey,
    });
  }

  putFile = async (
    path: string,
    contents: string | Uint8Array | ArrayBufferView | Blob,
    { encrypt = true, sign }: { encrypt?: boolean; sign?: boolean }
  ) => {
    if (!this.gaiaHubConfig) return;
    if (!this.hasSession) return;
    if (!this.account.appPrivateKey) return;

    return putFile(path, contents, {
      privateKey: this.account.appPrivateKey,
      gaiaHubConfig: this.gaiaHubConfig,
      encrypt,
      sign,
      wasString: typeof contents === 'string',
    });
  };

  getFile = async (
    path: string,
    { decrypt = true, verify }: { decrypt?: boolean; verify?: boolean }
  ) => {
    if (!this.gaiaHubConfig) return;
    if (!this.hasSession) return;
    if (!this.account.appPrivateKey) return;

    return getFile(path, {
      privateKey: this.account.appPrivateKey,
      gaiaHubConfig: this.gaiaHubConfig,
      decrypt,
      verify,
    });
  };

  /** ------------------------------------------------------------------------------------------------------------------
   *   Fetchers
   *  ------------------------------------------------------------------------------------------------------------------
   */

  async fetchBNSName(): Promise<string | undefined> {
    if (!this.hasSession || !this.stxAddress) return undefined;
    const path = this.network.getCoreApiUrl() + `/v1/addresses/stacks/${this.stxAddress}`;
    try {
      const res = await this.fetcher(path);
      const json: { names?: string[] } = await res.json();
      return json?.names?.[0];
    } catch (e) {
      console.log('[micro-stacks/react] fetchBNSName failed', e);
    }
    return undefined;
  }

  async fetchZoneFile(): Promise<any> {
    try {
      if (!this.hasSession || !this.stxAddress) return undefined;
      const username = await this.fetchBNSName();
      if (!username) return undefined;
      const path = this.network.getCoreApiUrl() + `/v1/names/${this.stxAddress}/zonefile`;
      const res = await this.fetcher(path);
      const payload = await res.json();
      return payload as { zonefile: string; address: string };
    } catch (e) {
      console.log('[micro-stacks/react] fetchZoneFile failed', e);
    }
    return undefined;
  }

  async fetchProfile(): Promise<Profile | undefined> {
    if (!this.hasSession || !this.account?.profile_url) return undefined;
    try {
      const res = await this.fetcher(this.account.profile_url);
      const json = await res.json();
      return json as Profile;
    } catch (e) {
      console.log('[micro-stacks/react] getProfile failed', e);
    }
    return undefined;
  }
}
