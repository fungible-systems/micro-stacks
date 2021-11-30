import { bytesToHex, fetchPrivate } from 'micro-stacks/common';
import { TxRejectedReason } from '../common/constants';
import { StacksTransaction } from '../transaction';
import { StacksNetwork } from 'micro-stacks/network';

export type TxBroadcastResultOk = string;
export type TxBroadcastResultRejected = {
  error: string;
  reason: TxRejectedReason;
  reason_data: any;
  txid: string;
};
export type TxBroadcastResult = TxBroadcastResultOk | TxBroadcastResultRejected;

/**
 * Broadcast the signed transaction to a core node
 *
 * @param {StacksTransaction} transaction - the token transfer transaction to broadcast
 * @param {StacksNetwork} network - the Stacks network to broadcast transaction to
 * @param {Uint8Array} attachment - Optional attachment to include
 *
 * @returns {Promise} that resolves to a response if the operation succeeds
 */
export async function broadcastTransaction(
  transaction: StacksTransaction,
  network: StacksNetwork,
  attachment?: Uint8Array
): Promise<TxBroadcastResult> {
  const rawTx = transaction.serialize();
  const url = network.getBroadcastApiUrl();

  return broadcastRawTransaction(rawTx, url, attachment);
}

/**
 * Broadcast the signed transaction to a core node
 *
 * @param {Buffer} rawTx - the raw serialized transaction buffer to broadcast
 * @param {string} url - the broadcast endpoint URL
 *
 * @param attachment
 * @returns {Promise} that resolves to a response if the operation succeeds
 */
export async function broadcastRawTransaction(
  rawTx: Uint8Array,
  url: string,
  attachment?: Uint8Array
): Promise<TxBroadcastResult> {
  const options = {
    method: 'POST',
    headers: { 'Content-Type': attachment ? 'application/json' : 'application/octet-stream' },
    body: attachment
      ? JSON.stringify({
          tx: bytesToHex(rawTx),
          attachment: bytesToHex(attachment),
        })
      : rawTx,
  };

  const response = await fetchPrivate(url, options);
  if (!response.ok) {
    try {
      return (await response.json()) as TxBroadcastResult;
    } catch (e) {
      throw Error(`Failed to broadcast transaction: ${(e as Error).message}`);
    }
  }

  const text = await response.text();
  try {
    return JSON.parse(text) as TxBroadcastResult;
  } catch (e) {
    return text;
  }
}
