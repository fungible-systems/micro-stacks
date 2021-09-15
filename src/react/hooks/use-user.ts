import { useCurrentNetworkChain, userDataAtom } from '../../react';
import { useAtomValue } from 'jotai/utils';
import { userStxAddressesAtom } from '../store/auth';

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
