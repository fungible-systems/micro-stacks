import { FungibleConditionCode, NonFungibleConditionCode } from '../common/constants';
import { IntegerType } from 'micro-stacks/common';
import {
  createFungiblePostCondition,
  createNonFungiblePostCondition,
  createSTXPostCondition,
  FungiblePostCondition,
  NonFungiblePostCondition,
  STXPostCondition,
} from '../postcondition';
import { createContractPrincipal, createStandardPrincipal } from '../types';
import { AssetInfo, ClarityValue } from 'micro-stacks/clarity';

/**
 * Generates a STX post condition with a standard principal
 *
 * Returns a STX post condition object
 *
 * @param address - the c32check address
 * @param conditionCode - the condition code
 * @param amount - the amount of STX tokens
 */
export function makeStandardSTXPostCondition(
  address: string,
  conditionCode: FungibleConditionCode,
  amount: IntegerType
): STXPostCondition {
  return createSTXPostCondition(createStandardPrincipal(address), conditionCode, amount);
}

/**
 * Generates a STX post condition with a contract principal
 *
 * Returns a STX post condition object
 *
 * @param address - the c32check address of the contract
 * @param contractName - the name of the contract
 * @param conditionCode - the condition code
 * @param amount - the amount of STX tokens
 *
 * @return {STXPostCondition}
 */
export function makeContractSTXPostCondition(
  address: string,
  contractName: string,
  conditionCode: FungibleConditionCode,
  amount: IntegerType
): STXPostCondition {
  return createSTXPostCondition(
    createContractPrincipal(address, contractName),
    conditionCode,
    amount
  );
}

/**
 * Generates a fungible token post condition with a standard principal
 *
 * Returns a fungible token post condition object
 *
 * @param address - the c32check address
 * @param conditionCode - the condition code
 * @param amount - the amount of fungible tokens
 * @param assetInfo - asset info describing the fungible token
 */
export function makeStandardFungiblePostCondition(
  address: string,
  conditionCode: FungibleConditionCode,
  amount: IntegerType,
  assetInfo: string | AssetInfo
): FungiblePostCondition {
  return createFungiblePostCondition(
    createStandardPrincipal(address),
    conditionCode,
    amount,
    assetInfo
  );
}

/**
 * Generates a fungible token post condition with a contract principal
 *
 * Returns a fungible token post condition object
 *
 * @param address - the c32check address
 * @param contractName - the name of the contract
 * @param conditionCode - the condition code
 * @param amount - the amount of fungible tokens
 * @param assetInfo - asset info describing the fungible token
 */
export function makeContractFungiblePostCondition(
  address: string,
  contractName: string,
  conditionCode: FungibleConditionCode,
  amount: IntegerType,
  assetInfo: string | AssetInfo
): FungiblePostCondition {
  return createFungiblePostCondition(
    createContractPrincipal(address, contractName),
    conditionCode,
    amount,
    assetInfo
  );
}

/**
 * Generates a non-fungible token post condition with a standard principal
 *
 * Returns a non-fungible token post condition object
 *
 * @param  {String} address - the c32check address
 * @param  {FungibleConditionCode} conditionCode - the condition code
 * @param  {AssetInfo} assetInfo - asset info describing the non-fungible token
 * @param  {ClarityValue} assetName - asset name describing the non-fungible token
 *
 * @return {NonFungiblePostCondition}
 */
export function makeStandardNonFungiblePostCondition(
  address: string,
  conditionCode: NonFungibleConditionCode,
  assetInfo: string | AssetInfo,
  assetName: ClarityValue
): NonFungiblePostCondition {
  return createNonFungiblePostCondition(
    createStandardPrincipal(address),
    conditionCode,
    assetInfo,
    assetName
  );
}

/**
 * Generates a non-fungible token post condition with a contract principal
 *
 * Returns a non-fungible token post condition object
 *
 * @param  {String} address - the c32check address
 * @param  {String} contractName - the name of the contract
 * @param  {FungibleConditionCode} conditionCode - the condition code
 * @param  {AssetInfo} assetInfo - asset info describing the non-fungible token
 * @param  {ClarityValue} assetName - asset name describing the non-fungible token
 *
 * @return {NonFungiblePostCondition}
 */
export function makeContractNonFungiblePostCondition(
  address: string,
  contractName: string,
  conditionCode: NonFungibleConditionCode,
  assetInfo: string | AssetInfo,
  assetName: ClarityValue
): NonFungiblePostCondition {
  return createNonFungiblePostCondition(
    createContractPrincipal(address, contractName),
    conditionCode,
    assetInfo,
    assetName
  );
}
