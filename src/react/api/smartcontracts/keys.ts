import { makeQueryKey } from 'jotai-query-toolkit';
import {
  NetworkWithContractIdUnanchored,
  NetworkWithContractIdUnanchoredLimitOffset,
  NetworkWithContractAddressContractNameTip,
  NetworkWithContractAddressContractNameMapNameProofTipLookupKey,
  NetworkWithContractAddressContractNameProofTip,
  ContractNameContractAddressFunctionNameFunctionArgsSenderAddressNetworkTip,
} from '../../types';

export enum SmartcontractsClientKeys {
  ContractById = 'smartcontracts/ContractById',
  ContractEventsById = 'smartcontracts/ContractEventsById',
  ContractInterface = 'smartcontracts/ContractInterface',
  ContractDataMapEntry = 'smartcontracts/ContractDataMapEntry',
  ContractSource = 'smartcontracts/ContractSource',
  ReadOnlyFunction = 'smartcontracts/ReadOnlyFunction',
}

export const makeSmartcontractsClientKeys = {
  contractById: (params: NetworkWithContractIdUnanchored) =>
    makeQueryKey(SmartcontractsClientKeys.ContractById, params),
  contractEventsById: (params: NetworkWithContractIdUnanchoredLimitOffset) =>
    makeQueryKey(SmartcontractsClientKeys.ContractEventsById, params),
  contractInterface: (params: NetworkWithContractAddressContractNameTip) =>
    makeQueryKey(SmartcontractsClientKeys.ContractInterface, params),
  contractDataMapEntry: (params: NetworkWithContractAddressContractNameMapNameProofTipLookupKey) =>
    makeQueryKey(SmartcontractsClientKeys.ContractDataMapEntry, params),
  contractSource: (params: NetworkWithContractAddressContractNameProofTip) =>
    makeQueryKey(SmartcontractsClientKeys.ContractSource, params),
  readOnlyFunction: (
    params: ContractNameContractAddressFunctionNameFunctionArgsSenderAddressNetworkTip
  ) => makeQueryKey(SmartcontractsClientKeys.ReadOnlyFunction, params),
};
