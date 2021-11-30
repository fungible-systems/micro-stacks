import { StacksTransaction } from '../transaction';
import { IntegerType, TransactionVersion } from 'micro-stacks/common';
import { AddressHashMode, SingleSigHashMode } from '../common/constants';
import { StacksMainnet, StacksTestnet } from 'micro-stacks/network';
import { createStacksPrivateKey, pubKeyfromPrivKey, publicKeyToString } from '../keys';
import { PayloadType } from '../payload';
import { publicKeyToStxAddress, StacksNetworkVersion } from 'micro-stacks/crypto';
import { createSingleSigSpendingCondition } from '../authorization';
import { TransactionSigner } from '../signer';
import {
  estimateContractDeploy,
  estimateContractFunctionCall,
  estimateTransfer,
  getNonce,
} from '../fetchers';
import { SponsorOptionsOpts } from './types';

/**
 * Constructs and signs a sponsored transaction as the sponsor
 *
 * @param  {SponsorOptionsOpts} sponsorOptions - the sponsor options object
 *
 * Returns a signed sponsored transaction.
 *
 * @return {ClarityValue}
 */
export async function sponsorTransaction(
  sponsorOptions: SponsorOptionsOpts
): Promise<StacksTransaction> {
  const defaultOptions = {
    fee: 0 as IntegerType,
    sponsorNonce: 0 as IntegerType,
    sponsorAddressHashmode: AddressHashMode.SerializeP2PKH as SingleSigHashMode,
  };

  const options = Object.assign(defaultOptions, sponsorOptions);
  const network =
    sponsorOptions.network ??
    (options.transaction.version === TransactionVersion.Mainnet
      ? new StacksMainnet()
      : new StacksTestnet());
  const sponsorPubKey = pubKeyfromPrivKey(options.sponsorPrivateKey);

  if (sponsorOptions.fee === undefined || sponsorOptions.fee === null) {
    let txFee = BigInt(0);
    switch (options.transaction.payload.payloadType) {
      case PayloadType.TokenTransfer:
        txFee = await estimateTransfer(options.transaction, network);
        break;
      case PayloadType.SmartContract:
        txFee = await estimateContractDeploy(options.transaction, network);
        break;
      case PayloadType.ContractCall:
        txFee = await estimateContractFunctionCall(options.transaction, network);
        break;
      default:
        throw new Error(
          `Sponsored transactions not supported for transaction type ${
            PayloadType[options.transaction.payload.payloadType]
          }`
        );
    }
    options.transaction.setFee(txFee);
    options.fee = txFee;
  }

  if (sponsorOptions.sponsorNonce === undefined || sponsorOptions.sponsorNonce === null) {
    const addressVersion =
      network.version === TransactionVersion.Mainnet
        ? StacksNetworkVersion.mainnetP2PKH
        : StacksNetworkVersion.testnetP2PKH;

    const senderAddress = publicKeyToStxAddress(publicKeyToString(sponsorPubKey), addressVersion);
    const sponsorNonce = await getNonce(senderAddress, network);
    options.sponsorNonce = sponsorNonce;
  }

  const sponsorSpendingCondition = createSingleSigSpendingCondition(
    options.sponsorAddressHashmode,
    publicKeyToString(sponsorPubKey),
    options.sponsorNonce,
    options.fee
  );

  options.transaction.setSponsor(sponsorSpendingCondition);

  const privKey = createStacksPrivateKey(options.sponsorPrivateKey);
  const signer = TransactionSigner.createSponsorSigner(
    options.transaction,
    sponsorSpendingCondition
  );
  await signer.signSponsor(privKey);

  return signer.transaction;
}
