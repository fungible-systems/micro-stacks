import { currentNetworkName, networkAtom } from '../store/network';
import { StacksMainnet, StacksNetwork, StacksRegtest, StacksTestnet } from 'micro-stacks/network';
import { useCallback } from 'react';
import { useAtomValue, useUpdateAtom } from 'jotai/utils';
import { ChainID } from 'micro-stacks/common';

export function useNetwork() {
  const network = useAtomValue<StacksNetwork>(networkAtom);
  const name = useAtomValue(currentNetworkName);
  const setNetwork = useUpdateAtom<
    StacksNetwork | StacksTestnet | StacksMainnet | StacksRegtest,
    StacksNetwork | StacksTestnet | StacksMainnet | StacksRegtest,
    void
  >(networkAtom);

  const handleSetNetwork = useCallback(
    (network: StacksNetwork) => setNetwork(network),
    [setNetwork]
  );

  const handleSetTestnet = () => handleSetNetwork(new StacksTestnet());
  const handleSetMainnet = () => handleSetNetwork(new StacksMainnet());
  const handleSetRegtest = () => handleSetNetwork(new StacksRegtest());

  return {
    network,
    chain: network.chainId === ChainID.Mainnet ? 'mainnet' : 'testnet',
    name,
    handleSetMainnet,
    handleSetTestnet,
    handleSetRegtest,
    handleSetNetwork,
  };
}

export const useCurrentNetworkChain = () => {
  const network = useAtomValue<StacksNetwork>(networkAtom);
  return network?.chainId === ChainID.Mainnet ? 'mainnet' : 'testnet';
};

export const useCurrentNetworkUrl = () => {
  const network = useAtomValue<StacksNetwork>(networkAtom);
  return network?.getCoreApiUrl();
};
