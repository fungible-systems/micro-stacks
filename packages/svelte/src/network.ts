import { getNetwork, watchNetwork as _watchNetwork } from '@micro-stacks/client';
import { ChainID, StacksNetwork } from 'micro-stacks/network';
import { derived } from 'svelte/store';

import { getClient } from './store';
import { readableClientState } from './utils';

interface WatchNetwork {
  network: StacksNetwork;
  isMainnet: boolean;
  setNetwork: (network: 'mainnet' | 'testnet' | StacksNetwork) => void;
}

const networkStore = readableClientState(getNetwork, _watchNetwork);

export function watchNetwork() {
  const client = getClient();

  const modifyNetwork = (network: StacksNetwork): WatchNetwork => {
    network.isMainnet = () => network.chainId === ChainID.Mainnet;

    return {
      /**
       * actions
       */
      setNetwork: client.setNetwork,
      /**
       * state
       */
      network,
      isMainnet: network.isMainnet(),
    };
  };

  return derived([networkStore()], ([network]: [StacksNetwork]) => {
    return modifyNetwork(network!);
  });
}
