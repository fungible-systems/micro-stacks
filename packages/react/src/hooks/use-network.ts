import { useMicroStacksClient } from './use-client';
import { ChainID, StacksNetwork } from 'micro-stacks/network';
import { useCallback, useMemo } from 'react';
import { getNetwork, watchNetwork } from '@micro-stacks/client';
import { clientStateHookFactory } from '../common/utils';

/** ------------------------------------------------------------------------------------------------------------------
 *   Types
 *  ------------------------------------------------------------------------------------------------------------------
 */

interface UseNetwork {
  network: StacksNetwork;
  isMainnet: boolean;
  setNetwork: (network: 'mainnet' | 'testnet' | StacksNetwork) => void;
}

/** ------------------------------------------------------------------------------------------------------------------
 *   State values
 *  ------------------------------------------------------------------------------------------------------------------
 */

const useNetworkValue = clientStateHookFactory(getNetwork, watchNetwork);

/** ------------------------------------------------------------------------------------------------------------------
 *   useNetwork hook (derived and actions)
 *  ------------------------------------------------------------------------------------------------------------------
 */
export function useNetwork(): UseNetwork {
  const client = useMicroStacksClient();
  const network = useNetworkValue();

  network.isMainnet = useCallback(() => network.chainId === ChainID.Mainnet, [network.chainId]);

  const isMainnet = useMemo(() => network.isMainnet(), [network]);

  return {
    /**
     * actions
     */
    setNetwork: client.setNetwork,
    /**
     * state
     */
    network,
    isMainnet,
  };
}
