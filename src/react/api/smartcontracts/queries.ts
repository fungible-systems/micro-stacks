import { Queries } from 'jotai-query-toolkit/nextjs';
import { makeSmartcontractsClientKeys } from './keys';
import {
  fetchContractById,
  fetchContractEventsById,
  fetchContractInterface,
  fetchContractDataMapEntry,
  fetchContractSource,
  fetchReadOnlyFunction,
} from '../../../api/smartcontracts/fetchers';
import { ClarityValue } from 'micro-stacks/clarity';
import { cvToHex } from 'micro-stacks/clarity';

export interface ContractByIdParams {
  networkUrl: string;
  contractId: string;
  unanchored: boolean;
}

export interface ContractEventsByIdParams {
  networkUrl: string;
  contractId: string;
  unanchored: boolean;
  limit?: number;
  offset?: number;
}

export interface ContractInterfaceParams {
  networkUrl: string;
  contractAddress: string;
  contractName: string;
  tip: string;
}

export interface ContractDataMapEntryParams {
  networkUrl: string;
  contractAddress: string;
  contractName: string;
  mapName: string;
  proof: number;
  tip: string;
  lookupKey: string;
}

export interface ContractSourceParams {
  networkUrl: string;
  contractAddress: string;
  contractName: string;
  proof: number;
  tip: string;
}

export interface ContractReadOnlyFunctionParams {
  networkUrl: string;
  contractAddress: string;
  contractName: string;
  functionName: string;
  functionArgs: ClarityValue[];
  senderAddress: string;
  tip: string;
}

export function contractByIdQuery(params: ContractByIdParams): Queries[number] {
  const { networkUrl, contractId, unanchored } = params;
  return [
    makeSmartcontractsClientKeys.contractById([networkUrl, contractId, unanchored]),
    async () =>
      fetchContractById({
        url: networkUrl,
        contract_id: contractId,
        unanchored,
      }),
  ];
}

export function contractEventsByIdQuery(params: ContractEventsByIdParams): Queries[number] {
  const { networkUrl, contractId, unanchored, limit, offset } = params;
  return [
    makeSmartcontractsClientKeys.contractEventsById([
      networkUrl,
      contractId,
      unanchored,
      limit,
      offset,
    ]),
    async () =>
      fetchContractEventsById({
        url: networkUrl,
        contract_id: contractId,
        unanchored,
        limit,
        offset,
      }),
  ];
}

export function contractInterface(params: ContractInterfaceParams): Queries[number] {
  const { networkUrl, contractAddress, contractName, tip } = params;
  return [
    makeSmartcontractsClientKeys.contractInterface([
      networkUrl,
      contractAddress,
      contractName,
      tip,
    ]),
    async () =>
      fetchContractInterface({
        url: networkUrl,
        contract_address: contractAddress,
        contract_name: contractName,
        tip,
      }),
  ];
}

export function contractDataMapEntry(params: ContractDataMapEntryParams): Queries[number] {
  const { networkUrl, contractName, contractAddress, mapName, proof, tip, lookupKey } = params;
  return [
    makeSmartcontractsClientKeys.contractDataMapEntry([
      networkUrl,
      contractName,
      contractAddress,
      mapName,
      proof,
      tip,
      lookupKey,
    ]),
    async () =>
      fetchContractDataMapEntry({
        url: networkUrl,
        contract_address: contractAddress,
        contract_name: contractName,
        map_name: mapName,
        proof,
        tip,
        lookup_key: lookupKey,
      }),
  ];
}

export function contractSourceQuery(params: ContractSourceParams): Queries[number] {
  const { networkUrl, contractAddress, contractName, proof, tip } = params;
  return [
    makeSmartcontractsClientKeys.contractSource([
      networkUrl,
      contractAddress,
      contractName,
      proof,
      tip,
    ]),
    async () =>
      fetchContractSource({
        url: networkUrl,
        contract_address: contractAddress,
        contract_name: contractName,
        proof,
        tip,
      }),
  ];
}
// TODO: missing network
export function readOnlyFunctionQuery(params: ContractReadOnlyFunctionParams): Queries[number] {
  const {
    networkUrl,
    contractName,
    contractAddress,
    functionName,
    functionArgs,
    senderAddress,
    tip,
  } = params;
  const functionArgsHex = functionArgs.map(arg => cvToHex(arg));
  return [
    makeSmartcontractsClientKeys.readOnlyFunction([
      networkUrl,
      contractName,
      contractAddress,
      functionName,
      functionArgsHex,
      senderAddress,
      tip,
    ]),
    async () =>
      fetchReadOnlyFunction({
        url: networkUrl,
        contractAddress,
        contractName,
        functionName,
        functionArgs,
        senderAddress,
        tip,
      }),
  ];
}
