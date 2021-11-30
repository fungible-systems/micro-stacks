import { StacksTransaction } from '../transaction';
import { StacksMainnet, StacksNetwork } from 'micro-stacks/network';
import { PayloadType } from '../payload';
import { fetchPrivate } from 'micro-stacks/common';

/**
 * Estimate the total transaction fee in microstacks for a token transfer
 *
 * @param {StacksTransaction} transaction - the token transfer transaction to estimate fees for
 * @param {StacksNetwork} network - the Stacks network to estimate transaction for
 *
 * @return a promise that resolves to number of microstacks per byte
 */
export async function estimateTransfer(
  transaction: StacksTransaction,
  network?: StacksNetwork
): Promise<bigint> {
  if (transaction.payload.payloadType !== PayloadType.TokenTransfer) {
    throw new Error(
      `Transaction fee estimation only possible with ${
        PayloadType[PayloadType.TokenTransfer]
      } transactions. Invoked with: ${PayloadType[transaction.payload.payloadType]}`
    );
  }

  const requestHeaders = {
    Accept: 'application/text',
  };

  const fetchOptions = {
    method: 'GET',
    headers: requestHeaders,
  };

  const defaultNetwork = new StacksMainnet();
  const url = network
    ? network.getTransferFeeEstimateApiUrl()
    : defaultNetwork.getTransferFeeEstimateApiUrl();
  const response = await fetchPrivate(url, fetchOptions);
  if (!response.ok) {
    let msg = '';
    try {
      msg = await response.text();
    } catch (error) {}
    throw new Error(
      `Error estimating transaction fee. Response ${response.status}: ${response.statusText}. Attempted to fetch ${url} and failed with the message: "${msg}"`
    );
  }
  const feeRateResult = await response.text();
  const txBytes = BigInt(transaction.serialize().byteLength);
  const feeRate = BigInt(feeRateResult);
  return feeRate * txBytes;
}
