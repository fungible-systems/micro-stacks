import { StacksTransaction } from '../transaction';
import { StacksMainnet, StacksNetwork } from 'micro-stacks/network';
import { PayloadType } from '../payload';
import { fetchPrivate, intToBigInt } from 'micro-stacks/common';

/**
 * Estimate the total transaction fee in microstacks for a contract deploy
 *
 * @param {StacksTransaction} transaction - the token transfer transaction to estimate fees for
 * @param {StacksNetwork} network - the Stacks network to estimate transaction for
 *
 * @return a promise that resolves to number of microstacks per byte
 */
export async function estimateContractDeploy(
  transaction: StacksTransaction,
  network?: StacksNetwork
): Promise<bigint> {
  if (
    transaction.payload.payloadType !== PayloadType.SmartContract &&
    transaction.payload.payloadType !== PayloadType.VersionedSmartContract
  ) {
    throw new Error(
      `Contract deploy fee estimation only possible with ${
        PayloadType[PayloadType.SmartContract]
      } or ${PayloadType[PayloadType.VersionedSmartContract]} transactions. Invoked with: ${
        PayloadType[transaction.payload.payloadType]
      }`
    );
  }

  const requestHeaders = {
    Accept: 'application/text',
  };

  const fetchOptions = {
    method: 'GET',
    headers: requestHeaders,
  };

  // Place holder estimate until contract deploy fee estimation is fully implemented on Stacks
  // blockchain core
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
      `Error estimating contract deploy fee. Response ${response.status}: ${response.statusText}. Attempted to fetch ${url} and failed with the message: "${msg}"`
    );
  }
  const feeRateResult = await response.text();
  const txBytes = intToBigInt(transaction.serialize().byteLength, false);
  const feeRate = intToBigInt(feeRateResult, false);
  return feeRate * txBytes;
}
