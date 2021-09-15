import type {
  ContractCallTxOptions,
  ContractDeployTxOptions,
  StxTransferTxOptions,
  TransactionPayloadBase,
} from 'micro-stacks/connect';
import {
  makeContractCallToken,
  makeContractDeployToken,
  makeStxTransferToken,
  openTransactionPopup,
} from 'micro-stacks/connect';
import { useAuthOptions } from './use-session';
import { useCallback } from 'react';
import { useNetwork } from './use-network';
import { useUserData } from './use-user';
import { ChainID } from 'micro-stacks/common';

interface MakeContractCallOptions extends Omit<ContractCallTxOptions, 'privateKey'> {
  onFinish?: TransactionPayloadBase['onFinish'];
  onCancel?: TransactionPayloadBase['onCancel'];
}

interface MakeContractDeployOptions extends Omit<ContractDeployTxOptions, 'privateKey'> {
  onFinish?: TransactionPayloadBase['onFinish'];
  onCancel?: TransactionPayloadBase['onCancel'];
}

interface MakeStxTransferOptions extends Omit<StxTransferTxOptions, 'privateKey'> {
  onFinish?: TransactionPayloadBase['onFinish'];
  onCancel?: TransactionPayloadBase['onCancel'];
}

export function useTransactionPopup() {
  const userData = useUserData();
  const authOptions = useAuthOptions();
  const { network } = useNetwork();

  const handleContractCall = useCallback(
    async ({ onFinish, onCancel, ...options }: MakeContractCallOptions) => {
      if (!userData?.appPrivateKey) throw Error('User is not signed in');
      const _network = options.network || network;
      const stxAddress =
        _network.chainId === ChainID.Testnet
          ? userData.addresses.testnet
          : userData.addresses.mainnet;

      const token = await makeContractCallToken({
        stxAddress,
        privateKey: userData?.appPrivateKey,
        appDetails: authOptions?.appDetails,
        ...options,
        network: _network,
      });
      return openTransactionPopup({
        token,
        onFinish,
        onCancel,
      });
    },
    [authOptions, userData, network]
  );

  const handleContractDeploy = useCallback(
    async ({ onFinish, onCancel, ...options }: MakeContractDeployOptions) => {
      if (!userData?.appPrivateKey) throw Error('User is not signed in');
      const _network = options.network || network;
      const stxAddress =
        _network.chainId === ChainID.Testnet
          ? userData.addresses.testnet
          : userData.addresses.mainnet;

      const token = await makeContractDeployToken({
        stxAddress,
        privateKey: userData?.appPrivateKey,
        appDetails: authOptions?.appDetails,
        ...options,
        network: _network,
      });
      return openTransactionPopup({
        token,
        onFinish,
        onCancel,
      });
    },
    [authOptions, userData, network]
  );

  const handleStxTransfer = useCallback(
    async ({ onFinish, onCancel, ...options }: MakeStxTransferOptions) => {
      if (!userData?.appPrivateKey) throw Error('User is not signed in');
      const _network = options.network || network;
      const stxAddress =
        _network.chainId === ChainID.Testnet
          ? userData.addresses.testnet
          : userData.addresses.mainnet;
      const token = await makeStxTransferToken({
        stxAddress: stxAddress,
        privateKey: userData?.appPrivateKey,
        appDetails: authOptions?.appDetails,
        ...options,
        network: _network,
      });
      return openTransactionPopup({
        token,
        onFinish,
        onCancel,
      });
    },
    [authOptions, userData, network]
  );

  return {
    handleStxTransfer,
    handleContractCall,
    handleContractDeploy,
  };
}
