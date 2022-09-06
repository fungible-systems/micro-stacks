import { Account, ClientConfig, DebugOptions, DehydratedState, State } from './common/types';
import { ChainID, StacksMainnet, StacksNetwork, StacksTestnet } from 'micro-stacks/network';
import { Status, StatusKeys } from './common/constants';
import { bytesToHex, getGlobalObject, hexToBytes } from 'micro-stacks/common';
import { c32address, c32addressDecode } from 'micro-stacks/crypto';

export const VERSION = 1;

export function serialize({ state, version }: { state: State; version: number }) {
  return JSON.stringify([
    [state.network?.chainId, state.network?.getCoreApiUrl?.()],
    [
      state.currentAccountIndex,
      state.accounts.map(account => {
        return {
          appPrivateKey: account.appPrivateKey,
          address: c32address(account.address[0], hexToBytes(account.address[1])),
          profile_url: account.profile_url,
        };
      }),
    ],
    version,
  ]);
}

export function deserialize(str: string) {
  const data = JSON.parse(str);
  const [chainId, apiUrl] = data[0] as [ChainID, string];
  const [currentAccountIndex, accounts] = data[1];
  const version = data[2] ?? VERSION;

  const network =
    chainId === ChainID.Mainnet
      ? new StacksMainnet({ url: apiUrl })
      : new StacksTestnet({ url: apiUrl });

  return {
    network,
    currentAccountIndex,
    accounts: accounts.map((account: Omit<Account, 'address'> & { address: string }) => {
      const [version, hash] = c32addressDecode(account.address);
      return {
        appPrivateKey: account.appPrivateKey,
        address: [version, bytesToHex(hash)],
        profile_url: account.profile_url,
      };
    }),
    version,
  };
}

export const getNetwork = (
  network: StacksNetwork | 'testnet' | 'mainnet' | undefined
): StacksNetwork => {
  if (network) {
    if (typeof network !== 'string') return network;
    if (network === 'testnet') return new StacksTestnet();
  }
  return new StacksMainnet();
};

export const defaultState = ({
  network = new StacksMainnet(),
  ...config
}: ClientConfig): State => ({
  statuses: {
    [StatusKeys.Authentication]: Status.IsIdle,
    [StatusKeys.TransactionSigning]: Status.IsIdle,
    [StatusKeys.MessageSigning]: Status.IsIdle,
    [StatusKeys.StructuredMessageSigning]: Status.IsIdle,
  },
  network: getNetwork(network),
  appName: config.appName,
  appIconUrl: config.appIconUrl,
  accounts: [],
  currentAccountIndex: 0,
  onPersistState: config.onPersistState,
  onAuthentication: config.onAuthentication,
  onNoWalletFound: config.onNoWalletFound,
  onSignOut: config.onSignOut,
});

export const hydrate = (str: string, config: ClientConfig) => {
  try {
    const { version, ...state } = deserialize(str);
    return {
      state: {
        ...defaultState(config),
        ...state,
      },
      version,
    };
  } catch (e) {
    return {
      state: defaultState(config),
      version: VERSION,
    };
  }
};

export const getDebugState = () => {
  const storage = getGlobalObject('localStorage', { throwIfUnavailable: false });
  if (!storage) return;
  const debug = localStorage.getItem('MICRO_STACKS_DEBUG');
  if (debug) return JSON.parse(debug) as DebugOptions;
  return;
};

export function cleanDehydratedState(dehydratedState: string): string;
export function cleanDehydratedState(dehydratedState: null): null;
export function cleanDehydratedState(dehydratedState?: string | null) {
  if (!dehydratedState) return null;
  const state = JSON.parse(dehydratedState) as DehydratedState;

  return JSON.stringify([
    state[0],
    [state[1][0], state[1][1].map(account => ({ ...account, appPrivateKey: null }))],
    state[2],
  ]);
}
