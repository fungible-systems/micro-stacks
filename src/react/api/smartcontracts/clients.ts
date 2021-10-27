import { atomFamilyWithQuery } from 'jotai-query-toolkit';
import { hexToCV } from 'micro-stacks/clarity';
import { ClarityValue } from 'micro-stacks/clarity';

import {
  fetchContractById,
  fetchContractEventsById,
  fetchContractInterface,
  fetchContractDataMapEntry,
  fetchContractSource,
  fetchReadOnlyFunction,
} from '../../../api/smartcontracts/fetchers';
import { SmartcontractsClientKeys } from './keys';

import type {
  NetworkWithContractIdUnanchored,
  NetworkWithContractIdUnanchoredLimitOffset,
  NetworkWithContractAddressContractNameTip,
  NetworkWithContractAddressContractNameMapNameProofTipLookupKey,
  NetworkWithContractAddressContractNameProofTip,
  ContractNameContractAddressFunctionNameFunctionArgsSenderAddressNetworkTip,
} from '../../types';
import type {
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

export const contractByIdClientAtom = atomFamilyWithQuery<
  NetworkWithContractIdUnanchored,
  AbstractTransaction
>(
  SmartcontractsClientKeys.ContractById,
  async function queryFn(get, [url, contractId, unanchored]) {
    return fetchContractById({ url, contract_id: contractId, unanchored });
  }
);

export const contractEventsByIdAtom = atomFamilyWithQuery<
  NetworkWithContractIdUnanchoredLimitOffset,
  (
    | TransactionEventSmartContractLog
    | TransactionEventStxLock
    | TransactionEventStxAsset
    | TransactionEventFungibleAsset
    | TransactionEventNonFungibleAsset
  )[]
>(
  SmartcontractsClientKeys.ContractEventsById,
  async function queryFn(get, [url, contractId, unanchored, limit, offset]) {
    return fetchContractEventsById({ url, contract_id: contractId, unanchored, limit, offset });
  }
);

export const contractInterfaceAtom = atomFamilyWithQuery<
  NetworkWithContractAddressContractNameTip,
  ContractInterfaceResponse
>(
  SmartcontractsClientKeys.ContractInterface,
  async function queryFn(get, [url, contractAddress, contractName, tip]) {
    return fetchContractInterface({
      url,
      contract_address: contractAddress,
      contract_name: contractName,
      tip,
    });
  }
);

export const contractDataMapEntryAtom = atomFamilyWithQuery<
  NetworkWithContractAddressContractNameMapNameProofTipLookupKey,
  MapEntryResponse
>(
  SmartcontractsClientKeys.ContractDataMapEntry,
  async function queryFn(
    get,
    [url, contractName, contractAddress, mapName, proof, tip, lookupKey]
  ) {
    return fetchContractDataMapEntry({
      url,
      contract_name: contractName,
      contract_address: contractAddress,
      map_name: mapName,
      proof,
      tip,
      lookup_key: lookupKey,
    });
  }
);

export const contractSourceAtom = atomFamilyWithQuery<
  NetworkWithContractAddressContractNameProofTip,
  ContractSourceResponse
>(
  SmartcontractsClientKeys.ContractById,
  async function queryFn(get, [url, contractAddress, contractName, proof, tip]) {
    return fetchContractSource({
      url,
      contract_address: contractAddress,
      contract_name: contractName,
      proof,
      tip,
    });
  }
);

export const readOnlyFunction = atomFamilyWithQuery<
  ContractNameContractAddressFunctionNameFunctionArgsSenderAddressNetworkTip,
  ReadOnlyFunctionSuccessResponse
>(
  SmartcontractsClientKeys.ReadOnlyFunction,
  async function queryFn(
    get,
    [url, contractName, contractAddress, functionName, functionArgsHex, senderAddress, tip]
  ) {
    // TODO: validate this is correct:
    const functionArgs = functionArgsHex.forEach(arg => {
      return hexToCV(arg);
    }) as unknown as ClarityValue[];
    //const functionArgs = hexToCV(functionArgsHex);
    // TODO: add network?
    const network = undefined;
    return fetchReadOnlyFunction({
      url,
      contractName,
      contractAddress,
      functionName,
      functionArgs,
      senderAddress,
      network,
      tip,
    });
  }
);
