import {
  AbstractTransaction,
  ContractInterfaceResponse,
  TransactionEventSmartContractLog,
  TransactionEventStxLock,
  TransactionEventStxAsset,
  TransactionEventFungibleAsset,
  TransactionEventNonFungibleAsset,
  ContractSourceResponse,
  ReadOnlyFunctionSuccessResponse,
  MapEntryResponse,
} from '@stacks/stacks-blockchain-api-types';
import { cvToHex } from 'micro-stacks/clarity';
import { BaseListParams } from '../types';
import {
  fetchJson,
  fetchJsonPost,
  generateUrl,
  contractEndpoint,
  contractsEndpoint,
  v2Endpoint,
} from '../utils';
import { ReadOnlyFunctionFetcherOptions } from './types';

/**
 * Get contract info using the contract ID
 *
 * @see https://blockstack.github.io/stacks-blockchain-api/#operation/get_contract_by_id
 */

export async function fetchContractById({
  url,
  contract_id,
  unanchored,
}: BaseListParams & { contract_id: string; unanchored: boolean }) {
  const path = generateUrl(`${contractEndpoint(url)}/${contract_id}`, { unanchored });
  return fetchJson<AbstractTransaction>(path);
}

/**
 * Get contract events using a contract ID
 *
 * @see https://blockstack.github.io/stacks-blockchain-api/#operation/get_contract_events_by_id
 */

export async function fetchContractEventsById({
  url,
  contract_id,
  limit,
  offset,
  unanchored,
}: BaseListParams & { contract_id: string; unanchored: boolean }) {
  const path = generateUrl(`${contractEndpoint(url)}/${contract_id}/events`, {
    limit,
    offset,
    unanchored,
  });
  return fetchJson<
    (
      | TransactionEventSmartContractLog
      | TransactionEventStxLock
      | TransactionEventStxAsset
      | TransactionEventFungibleAsset
      | TransactionEventNonFungibleAsset
    )[]
  >(path);
}

/**
 * Get contract interface using a contract_address and contract name
 *
 * @see https://blockstack.github.io/stacks-blockchain-api/#operation/get_contract_interface
 */

export async function fetchContractInterface({
  url,
  contract_address,
  contract_name,
  tip,
}: BaseListParams & { contract_address: string; contract_name: string; tip: string }) {
  const path = generateUrl(
    `${contractsEndpoint(url)}/interface/${contract_address}/${contract_name}`,
    {
      tip,
    }
  );
  return fetchJson<ContractInterfaceResponse>(path);
}

/**
 * Get specific data-map inside a contract
 *
 * @see https://blockstack.github.io/stacks-blockchain-api/#operation/get_contract_data_map_entry
 */
export async function fetchContractDataMapEntry({
  url,
  contract_name,
  contract_address,
  map_name,
  proof,
  tip,
  lookup_key,
}: BaseListParams & {
  contract_name: string;
  contract_address: string;
  map_name: string;
  proof: number;
  tip: string;
  lookup_key: string;
}) {
  const body = lookup_key;
  const path = generateUrl(
    `${v2Endpoint(url)}/map_entry/${contract_address}/${contract_name}/${map_name}`,
    { proof: proof, tip: tip }
  );
  return fetchJsonPost<MapEntryResponse>(path, body);
}

/**
 * Get contract source
 *
 * @see https://blockstack.github.io/stacks-blockchain-api/#operation/get_contract_source
 */

export async function fetchContractSource({
  url,
  contract_address,
  contract_name,
  proof,
  tip,
}: BaseListParams & {
  contract_address: string;
  contract_name: string;
  proof: number;
  tip: string;
}) {
  const path = generateUrl(
    `${contractsEndpoint(url)}/source/${contract_address}/${contract_name}`,
    {
      proof,
      tip,
    }
  );
  return fetchJson<ContractSourceResponse>(path);
}

/**
 * Call a read-only public function on a given smart contract.
 *
 * @see https://blockstack.github.io/stacks-blockchain-api/#tag/fee_rate
 */
export async function fetchReadOnlyFunction({
  url,
  contractName,
  contractAddress,
  functionName,
  functionArgs,
  senderAddress,
  tip,
}: BaseListParams & ReadOnlyFunctionFetcherOptions) {
  const args = functionArgs.map(arg => cvToHex(arg));

  const body = JSON.stringify({
    sender: senderAddress,
    arguments: args,
  });
  const path = generateUrl(
    `${contractsEndpoint(url)}/call-read/${contractAddress}/${contractName}/${functionName}`,
    { tip: tip }
  );
  return fetchJsonPost<ReadOnlyFunctionSuccessResponse>(path, body);
}
