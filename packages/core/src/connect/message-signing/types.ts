import { ChainID } from 'micro-stacks/network';
import { ClarityValue } from 'micro-stacks/clarity';
import { SignatureData } from '../popup';
import { BaseRequestPayload } from '../common/requests';

export interface SignatureRequestOptions extends BaseRequestPayload {
  message: string;
}

export interface StructuredSignatureRequestOptions extends BaseRequestPayload {
  message: string | ClarityValue;
  domain: {
    name: string;
    version: string;
    // can be filled in from passed network
    // defaults to ChainID.Mainnet
    chainId?: ChainID;
  };
}

export type SignedOptionsWithOnHandlers<T> = T & {
  onFinish?: (payload: SignatureData) => void;
  onCancel?: (errorMessage?: string) => void;
};
