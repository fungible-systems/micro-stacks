import type { StacksNetwork } from 'micro-stacks/network';

export interface BaseRequestPayload {
  appDetails: {
    name: string;
    icon: string;
  };
  authOrigin?: string;
  stxAddress?: string | null;
  privateKey?: string;
  publicKey?: string | null;
  network?: StacksNetwork;
}
