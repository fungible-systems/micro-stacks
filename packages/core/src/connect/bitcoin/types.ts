import { BaseRequestPayload } from '../common/requests';

export enum SignatureHash {
  DEFAULT = 0,
  ALL = 1,
  NONE = 2,
  SINGLE = 3,
  ANYONECANPAY = 0x80,
}

export interface PsbtData {
  hex: string;
}

export type PSBTOptionsWithOnHandlers<T> = T & {
  onCancel?: () => void;
  onFinish?: (data: PsbtData) => void;
};

export interface PsbtPayload extends BaseRequestPayload {
  allowedSighash?: SignatureHash[];
  hex: string;
  signAtIndex?: number | number[];
}
