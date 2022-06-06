import { ChainID, StacksNetwork } from 'micro-stacks/network';
import { ClarityValue } from 'micro-stacks/clarity';
import { SignatureData } from '../popup';

export interface SignatureRequestOptions {
  message: string;
  appDetails: {
    name: string;
    icon: string;
  };
  authOrigin?: string;
  stxAddress: string;
  privateKey?: string;
  network?: StacksNetwork;
}

export type StructuredSignatureRequestOptions = Omit<SignatureRequestOptions, 'message'> & {
  message: string | ClarityValue;
  domain: {
    name: string;
    version: string;
    // can be filled in from passed network
    // defaults to ChainID.Mainnet
    chainId?: ChainID;
  };
};

export type SignedOptionsWithOnHandlers<T> = T & {
  onFinish?: (payload: SignatureData) => void;
  onCancel?: (errorMessage?: string) => void;
};
