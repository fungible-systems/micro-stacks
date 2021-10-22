import { StacksMainnet, StacksMocknet, StacksTestnet } from 'micro-stacks/network';
import { NetworkType } from './types';

export function getNetwork(network?: NetworkType) {
  if (!network) return;
  switch (network) {
    case 'mocknet':
      return new StacksMocknet();
    case 'testnet':
      return new StacksTestnet();
    case 'mainnet':
      return new StacksMainnet();
    default:
      return network;
  }
}

export enum MicroStacksProviderAtoms {
  AuthOptions = 'authOptions',
  StorageAdapter = 'storageAdapter',
  Network = 'network',
}
