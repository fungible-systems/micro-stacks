import { AuthOptions } from '../auth/types';
import { StacksNetwork } from 'micro-stacks/network';
import { ClarityValue } from 'micro-stacks/clarity';
import { SignatureData } from '../popup';

export interface SignatureRequestOptions {
  message: string;
  appDetails: AuthOptions['appDetails'];
  authOrigin?: string;
  stxAddress: string;
  privateKey: string;
  network?: StacksNetwork;
}

export type StructuredSignatureRequestOptions = Omit<SignatureRequestOptions, 'message'> & {
  message: string | ClarityValue;
};

export type SignedOptionsWithOnHandlers<T> = T & {
  onFinish?: (payload: SignatureData) => void;
  onCancel?: (errorMessage?: string) => void;
};
