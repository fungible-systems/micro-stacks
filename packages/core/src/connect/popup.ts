import { genericTransactionPopupFactory } from './popup-helper';
import type { StacksTransaction } from 'micro-stacks/transactions';
import type { PsbtData } from './bitcoin/types';

export interface FinishedTxData {
  stacksTransaction: StacksTransaction;
  txRaw: string;
  txId: string;
}

export const openTransactionPopup =
  genericTransactionPopupFactory<FinishedTxData>('transactionRequest');

export interface SignatureData {
  /**
   * Hex encoded DER signature
   */
  signature: string;
  /**
   *  Hex encoded private string taken from privateKey
   */
  publicKey: string;
}

export const openSignMessagePopup =
  genericTransactionPopupFactory<SignatureData>('signatureRequest');

export const openSignStructuredDataPopup = genericTransactionPopupFactory<SignatureData>(
  'structuredDataSignatureRequest'
);

export const openPSBTPopup = genericTransactionPopupFactory<PsbtData>('psbtRequest');
