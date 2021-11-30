import { StacksTransaction } from '../transaction';
import { StacksMainnet, StacksNetwork } from 'micro-stacks/network';
import { PayloadType } from '../payload';
import { fetchPrivate, intToBigInt } from 'micro-stacks/common';
import { ClarityAbi } from 'micro-stacks/clarity';

/**
 * Lookup the nonce for an address from a core node
 *
 * @param {string} address - the c32check address to look up
 * @param {StacksNetwork} network - the Stacks network to look up address on
 *
 * @return a promise that resolves to an integer
 */
export async function getNonce(address: string, network?: StacksNetwork): Promise<bigint> {
  const defaultNetwork = new StacksMainnet();
  const url = network
    ? network.getAccountApiUrl(address)
    : defaultNetwork.getAccountApiUrl(address);
  const response = await fetchPrivate(url);
  if (!response.ok) {
    let msg = '';
    try {
      msg = await response.text();
    } catch (error) {}
    throw new Error(
      `Error fetching nonce. Response ${response.status}: ${response.statusText}. Attempted to fetch ${url} and failed with the message: "${msg}"`
    );
  }
  const responseText = await response.text();
  const result = JSON.parse(responseText) as { nonce: string };
  return BigInt(result.nonce);
}

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

/**
 * Fetch a contract's ABI
 *
 * @param {string} address - the contracts address
 * @param {string} contractName - the contracts name
 * @param {StacksNetwork} network - the Stacks network to broadcast transaction to
 *
 * @returns {Promise} that resolves to a ClarityAbi if the operation succeeds
 */
export async function getAbi(
  address: string,
  contractName: string,
  network: StacksNetwork
): Promise<ClarityAbi> {
  const options = {
    method: 'GET',
  };

  const url = network.getAbiApiUrl(address, contractName);

  const response = await fetchPrivate(url, options);
  if (!response.ok) {
    let msg = '';
    try {
      msg = await response.text();
    } catch (error) {}
    throw new Error(
      `Error fetching contract ABI for contract "${contractName}" at address ${address}. Response ${response.status}: ${response.statusText}. Attempted to fetch ${url} and failed with the message: "${msg}"`
    );
  }

  return JSON.parse(await response.text()) as ClarityAbi;
}

/**
 * Estimate the total transaction fee in microstacks for a contract function call
 *
 * @param {StacksTransaction} transaction - the token transfer transaction to estimate fees for
 * @param {StacksNetwork} network - the Stacks network to estimate transaction for
 *
 * @return a promise that resolves to number of microstacks per byte
 */
export async function estimateContractFunctionCall(
  transaction: StacksTransaction,
  network?: StacksNetwork
): Promise<bigint> {
  if (transaction.payload.payloadType !== PayloadType.ContractCall) {
    throw new Error(
      `Contract call fee estimation only possible with ${
        PayloadType[PayloadType.ContractCall]
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

  // Place holder estimate until contract call fee estimation is fully implemented on Stacks
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
      `Error estimating contract call fee. Response ${response.status}: ${response.statusText}. Attempted to fetch ${url} and failed with the message: "${msg}"`
    );
  }
  const feeRateResult = await response.text();
  const txBytes = intToBigInt(transaction.serialize().byteLength, false);
  const feeRate = intToBigInt(feeRateResult, false);
  return feeRate * txBytes;
}

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
  if (transaction.payload.payloadType !== PayloadType.SmartContract) {
    throw new Error(
      `Contract deploy fee estimation only possible with ${
        PayloadType[PayloadType.SmartContract]
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
