import type {
  ContractCallTxOptions,
  ContractDeployTxOptions,
  FinishedTxData,
  StacksSessionState,
  StxTransferTxOptions,
} from 'micro-stacks/connect';
import type { StacksNetwork } from 'micro-stacks/network';
import type { ClientStorage } from './storage';
import { Status, StatusKeys, TxType } from './constants';
import { ChainID } from 'micro-stacks/network';
import { SignedOptionsWithOnHandlers } from 'micro-stacks/connect';
import { ClarityValue } from 'micro-stacks/clarity';

export interface AppDetails {
  /** A human-readable name for your application */
  name: string;
  /** A full URL that resolves to an image icon for your application */
  icon: string;
}

export type ContractCallParams = Omit<
  ContractCallTxOptions,
  'network' | 'privateKey' | 'appDetails' | 'stxAddress'
> & {
  onFinish?: (payload: FinishedTxData) => void;
  onCancel?: (error?: string) => void;
};
export type StxTransferParams = Omit<
  StxTransferTxOptions,
  'network' | 'privateKey' | 'appDetails' | 'stxAddress'
> & {
  onFinish?: (payload: FinishedTxData) => void;
  onCancel?: (error?: string) => void;
};
export type ContractDeployParams = Omit<
  ContractDeployTxOptions,
  'network' | 'privateKey' | 'appDetails' | 'stxAddress'
> & {
  onFinish?: (payload: FinishedTxData) => void;
  onCancel?: (error?: string) => void;
};

export interface SignTransactionRequest {
  (type: TxType.ContractDeploy, params: ContractDeployParams): Promise<FinishedTxData | undefined>;

  (type: TxType.ContractCall, params: ContractCallParams): Promise<FinishedTxData | undefined>;

  (type: TxType.TokenTransfer, params: StxTransferParams): Promise<FinishedTxData | undefined>;
}

type getInitialState = (key: string) => string | undefined;

export interface DebugOptions {
  disableAppPrivateKey?: boolean;
}

export interface ClientConfig {
  /**
   * appName
   * The name of the application. Required if interacting with a wallet.
   */
  appName?: string;
  /**
   * appIconUrl
   * A URL pointing to an icon for the application. Required if interacting with a wallet.
   */
  appIconUrl?: string;
  /**
   * storage
   * getItem: <Value = V>(key: string, defaultValue?: Value | null) => Value | null;
   * setItem: <Value>(key: string, value: Value | null) => void;
   * removeItem: (key: string) => void;
   */
  storage?: ClientStorage;
  /**
   * network
   * `testnet`, `mainnnet` or instance StacksNetwork
   */
  network?: 'testnet' | 'mainnet' | StacksNetwork;
  /**
   * dehydratedState
   * A string value of dehydrated state (via client.dehydrate())
   * OR a getter function: (key: string) => string | undefined
   */
  dehydratedState?: string | getInitialState;
  /**
   * onPersistState
   * Function that consumes dehydrated client state when state changes
   * Useful if you need to sync external storage to state changes e.g.: cookie session storage
   * @param dehydratedState - string serialized state
   */
  onPersistState?: (dehydratedState: string) => void | Promise<void>;
  /**
   * onSignOut
   * Fires when a session is signed out
   * Useful if you need to destroy some synced session e.g.: cookie session storage
   */
  onSignOut?: () => void;
  /**
   * onAuthentication
   * Function that fires on a successful authentication.
   * @param payload - StacksSessionState returned from the wallet
   */
  onAuthentication?: (payload: StacksSessionState) => void;
  fetcher?: (input: RequestInfo, init?: RequestInit) => Promise<Response>;
}

export interface Account {
  appPrivateKey?: string;
  address: [version: number, hash: Uint8Array];
  decentralizedID?: string;
  profile_url?: string;
}

export type State = {
  appName?: string;
  appIconUrl?: string;
  statuses: {
    [StatusKeys.Authentication]: Status;
    [StatusKeys.TransactionSigning]: Status;
    [StatusKeys.MessageSigning]: Status;
    [StatusKeys.StructuredMessageSigning]: Status;
  };
  network: StacksNetwork;
  currentAccountIndex: number;
  accounts: Account[];
  // actions
  onPersistState?: ClientConfig['onPersistState'];
  onSignOut?: ClientConfig['onSignOut'];
  onAuthentication?: ClientConfig['onAuthentication'];
};

export type OpenSignMessageParams = SignedOptionsWithOnHandlers<{ message: string }>;

export interface StructuredDataDomainTuple {
  name?: string;
  version?: string;
  chainId?: ChainID;
}

export type OpenSignStructuredMessageParams = SignedOptionsWithOnHandlers<{
  message: string | ClarityValue;
  domain?: StructuredDataDomainTuple;
}>;
