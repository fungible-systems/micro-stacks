import type {
  AbstractTransaction,
  ContractInterfaceResponse,
  TransactionEventSmartContractLog,
  TransactionEventStxLock,
  TransactionEventStxAsset,
  TransactionEventFungibleAsset,
  TransactionEventNonFungibleAsset,
  ContractSourceResponse,
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
import { CallReadOnlyFunctionRequest } from './types';
import { ReadOnlyFunctionArgsToJSON } from './utils';

/**
 * Get contract info using the contract ID
 *
 * @see https://docs.micro-stacks.dev/modules/core/api/smart-contracts#fetchcontractbyid
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
 * @see https://docs.micro-stacks.dev/modules/core/api/smart-contracts#fetchcontracteventsbyid
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
 * @see https://docs.micro-stacks.dev/modules/core/api/smart-contracts#fetchcontractinterface
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
 * @see https://docs.micro-stacks.dev/modules/core/api/smart-contracts#fetchcontractdatamapentry
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
  return fetchJsonPost<MapEntryResponse>(path, { body });
}

/**
 * Get contract source
 *
 * @see https://docs.micro-stacks.dev/modules/core/api/smart-contracts#fetchcontractsource
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
 * @see https://docs.micro-stacks.dev/modules/core/api/smart-contracts#fetchreadonlyfunction
 */
export async function fetchReadOnlyFunction<T>({
  contractAddress,
  contractName,
  functionArgs,
  sender = contractAddress,
  functionName,
  tip,
  url,
}: CallReadOnlyFunctionRequest & { url: string }) {
  if (!url) throw TypeError('[fetchReadOnlyFunction] no network url passed.');

  const pathArgs = `contracts/call-read/{contract_address}/{contract_name}/{function_name}`
    .replace(`{contract_address}`, encodeURIComponent(String(contractAddress)))
    .replace(`{contract_name}`, encodeURIComponent(String(contractName)))
    .replace(`{function_name}`, encodeURIComponent(String(functionName)));

  const path = `${v2Endpoint(url)}/${pathArgs}${typeof tip === 'string' ? `?tip=${tip}` : ''}`;

  const args: string[] = functionArgs.map(arg => {
    if (typeof arg !== 'string') return cvToHex(arg);
    return arg;
  });

  return fetchJsonPost<T>(path, {
    body: ReadOnlyFunctionArgsToJSON({
      sender,
      arguments: args,
    }),
  });
}
