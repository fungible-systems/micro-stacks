import { useAtomValue } from 'jotai/utils';
import { userDataAtom, userStxAddressesAtom } from '../store/auth';
import { useCurrentNetworkChain } from './use-network';
import { useSession } from './use-session';

export function useUserData() {
  return useAtomValue(userDataAtom);
}

export function useStxAddresses() {
  return useAtomValue(userStxAddressesAtom);
}

export function useCurrentStxAddress() {
  const chain = useCurrentNetworkChain();
  const addresses = useStxAddresses();
  return addresses?.[chain];
}

export function useUser() {
  const userData = useUserData();
  const currentStxAddress = useCurrentStxAddress();
  const [session] = useSession();
  return {
    ...userData,
    ...session,
    currentStxAddress,
  };
}
