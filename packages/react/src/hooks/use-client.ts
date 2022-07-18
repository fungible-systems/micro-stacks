import { useContext } from 'react';
import { MicroStacksClientContext } from '../common/context';
import { clientStateHookFactory } from '../common/utils';
import type { Client } from '@micro-stacks/client';

/** ------------------------------------------------------------------------------------------------------------------
 *   useMicroStacksClient hook
 *  ------------------------------------------------------------------------------------------------------------------
 */

export const useMicroStacksClient = () => {
  const client = useContext<Client | null>(MicroStacksClientContext);
  if (!client) {
    throw new Error(
      'No MicroStacksClient set, wrap your app in MicroStacksClientProvider to set one'
    );
  }
  return client;
};

const useWatchAppDetails = clientStateHookFactory(opt => {
  return opt.client.selectAppDetails(opt.state ?? opt.client.getState());
});

export const useAppDetails = () => {
  const appDetails = useWatchAppDetails();
  return {
    appName: appDetails?.name,
    appIconUrl: appDetails?.icon,
  };
};
