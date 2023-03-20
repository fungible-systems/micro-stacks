import type { StacksNetwork } from 'micro-stacks/network';

export interface BaseRequestPayload {
  appDetails: {
    name: string;
    icon: string;
  };
  authOrigin?: string;
  stxAddress: string;
  privateKey?: string;
  publicKey?: string;
  network?: StacksNetwork;
}
