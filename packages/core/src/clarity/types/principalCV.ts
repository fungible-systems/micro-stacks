import {
  Address,
  LengthPrefixedString,
  createAddress,
  addressToString,
  createLPString,
} from '../common/utils';
import { ClarityType } from '../common/constants';
import { utf8ToBytes } from 'micro-stacks/common';

type PrincipalCV = StandardPrincipalCV | ContractPrincipalCV;

interface StandardPrincipalCV {
  readonly type: ClarityType.PrincipalStandard;
  readonly address: Address;
}

interface ContractPrincipalCV {
  readonly type: ClarityType.PrincipalContract;
  readonly address: Address;
  readonly contractName: LengthPrefixedString;
}

function principalToString(principal: PrincipalCV): string {
  if (principal.type === ClarityType.PrincipalStandard) {
    return addressToString(principal.address);
  } else if (principal.type === ClarityType.PrincipalContract) {
    const address = addressToString(principal.address);
    return `${address}.${principal.contractName.content}`;
  } else {
    throw new Error(`Unexpected principal data: ${JSON.stringify(principal)}`);
  }
}

function principalCV(principal: string): PrincipalCV {
  if (principal.includes('.')) {
    const [address, contractName] = principal.split('.');
    return contractPrincipalCV(address, contractName);
  } else {
    return standardPrincipalCV(principal);
  }
}

function standardPrincipalCV(addressString: string): StandardPrincipalCV {
  const addr = createAddress(addressString);
  return { type: ClarityType.PrincipalStandard, address: addr };
}

function standardPrincipalCVFromAddress(address: Address): StandardPrincipalCV {
  return { type: ClarityType.PrincipalStandard, address };
}

function _contractPrincipalCV(contractAddress: string, contractName: string): ContractPrincipalCV {
  const addr = createAddress(contractAddress);
  const lengthPrefixedContractName = createLPString(contractName);
  return contractPrincipalCVFromAddress(addr, lengthPrefixedContractName);
}

function contractPrincipalCV(
  /** pass either the contract_id or contract address */
  addressOrContractId: string,
  /** pass the contract name if the previous argument is only the address */
  contractName?: string
): ContractPrincipalCV {
  if (addressOrContractId.includes('.')) {
    const [address, name] = addressOrContractId.split('.');
    return _contractPrincipalCV(address, name);
  }
  if (!contractName)
    throw TypeError(`[micro-stacks] contractPrincipalCV requires contractName value`);
  return _contractPrincipalCV(addressOrContractId, contractName);
}

function contractPrincipalCVFromAddress(
  address: Address,
  contractName: LengthPrefixedString
): ContractPrincipalCV {
  if (utf8ToBytes(contractName.content).byteLength >= 128) {
    throw new Error('Contract name must be less than 128 bytes');
  }
  return { type: ClarityType.PrincipalContract, address, contractName };
}

function contractPrincipalCVFromStandard(
  sp: StandardPrincipalCV,
  contractName: string
): ContractPrincipalCV {
  const lengthPrefixedContractName = createLPString(contractName);
  return {
    type: ClarityType.PrincipalContract,
    address: sp.address,
    contractName: lengthPrefixedContractName,
  };
}

export {
  PrincipalCV,
  StandardPrincipalCV,
  ContractPrincipalCV,
  principalCV,
  principalToString,
  standardPrincipalCV,
  standardPrincipalCVFromAddress,
  contractPrincipalCV,
  contractPrincipalCVFromAddress,
  contractPrincipalCVFromStandard,
};
