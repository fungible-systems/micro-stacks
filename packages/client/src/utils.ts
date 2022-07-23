import { Account, ClientConfig, DebugOptions, DehydratedState, State } from './common/types';
import { ChainID, StacksMainnet, StacksNetwork, StacksTestnet } from 'micro-stacks/network';
import { Status, StatusKeys } from './common/constants';
import { bytesToHex, getGlobalObject, hexToBytes } from 'micro-stacks/common';
import { c32address, c32addressDecode } from 'micro-stacks/crypto';

import type { ClarityAbi, ClarityValue } from 'micro-stacks/clarity';
import { hexToCV, getCVTypeString } from 'micro-stacks/clarity';
import { getTypeString, matchClarityType } from 'micro-stacks/transactions';

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

const getNetwork = (network: StacksNetwork | 'testnet' | 'mainnet'): StacksNetwork => {
  if (typeof network !== 'string') return network;
  if (network === 'testnet') return new StacksTestnet();
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

export function validateFunctionCallWithAbi({
  functionName,
  functionArgs,
  abi,
}: {
  functionName: string;
  functionArgs: (string | ClarityValue)[];
  abi: ClarityAbi;
}):
  | {
      isValid: true;
    }
  | {
      isValid: false;
      error: string;
    } {
  const filtered = abi.functions.filter(fn => fn.name === functionName);
  if (filtered.length === 1) {
    const abiFunc = filtered[0];
    const abiArgs = abiFunc.args;

    if (functionArgs.length !== abiArgs.length)
      return {
        isValid: false,
        error: `The function you are calling (${functionName}) expects ${abiArgs.length} argument(s) but received ${functionArgs.length}`,
      };

    let error;

    for (let i = 0; i < functionArgs.length; i++) {
      if (!error) {
        const payloadArg: ClarityValue =
          typeof functionArgs[i] === 'string'
            ? hexToCV(functionArgs[i] as string)
            : (functionArgs[i] as ClarityValue);

        const abiArg = abiArgs[i];

        if (!matchClarityType(payloadArg, abiArg.type))
          error = `Clarity function \`${functionName}\` expects argument ${
            i + 1
          } to be of type ${getTypeString(abiArg.type)}, not ${getCVTypeString(payloadArg)}`;
      }
    }
    if (error)
      return {
        isValid: false,
        error,
      };
    return {
      isValid: true,
    };
  } else if (filtered.length === 0) {
    return {
      isValid: false,
      error: `ABI doesn't contain a function with the name ${functionName}`,
    };
  } else {
    return {
      isValid: false,
      error: `Malformed ABI. Contains multiple functions with the name ${functionName}`,
    };
  }
}

const abiCacheMap = new Map();

export function fetchAbi({
  network,
  contractAddress,
  contractName,
}: {
  network: StacksNetwork;
  contractAddress: string;
  contractName: string;
}) {
  return async function fetchAbi(
    fetcher: (input: RequestInfo, init?: RequestInit) => Promise<Response>
  ) {
    const match = abiCacheMap.get(`${contractAddress}.${contractName}`);
    if (match) return match as ClarityAbi;

    const url = network.getAbiApiUrl(contractAddress, contractName);

    const response = await fetcher(url, {
      method: 'GET',
    });

    if (!response.ok) {
      let msg = '';
      try {
        msg = await response.text();
      } catch (error) {}
      throw new Error(
        `Error fetching contract ABI for contract "${contractName}" at address ${contractAddress}. Response ${response.status}: ${response.statusText}. Attempted to fetch ${url} and failed with the message: "${msg}"`
      );
    }

    const abi = JSON.parse(await response.text()) as ClarityAbi;
    abiCacheMap.set(`${contractAddress}.${contractName}`, abi);
    return abi;
  };
}
