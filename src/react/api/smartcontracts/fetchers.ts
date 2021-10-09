import {
  AbstractTransaction,
  ContractInterfaceResponse,
  TransactionEventSmartContractLog,
  TransactionEventStxLock,
  TransactionEventStxAsset,
  TransactionEventFungibleAsset,
  TransactionEventNonFungibleAsset,
  ContractSourceResponse,
} from '@stacks/stacks-blockchain-api-types';
import { BaseListParams } from '../types';
import { fetchJson, generateUrl, contractEndpoint } from '../utils';

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
  const path = generateUrl(`${contractEndpoint(url)}/${contract_address}/${contract_name}`, {
    contract_address,
    contract_name,
    tip,
  });
  return fetchJson<ContractInterfaceResponse>(path);
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
  const path = generateUrl(`${contractEndpoint(url)}/${contract_address}/${contract_name}`, {
    contract_address,
    contract_name,
    proof,
    tip,
  });
  return fetchJson<ContractSourceResponse>(path);
}
