import { openPSBTPopup, safeGetPublicKey } from 'micro-stacks/connect';
import { Json } from 'micro-stacks/crypto';
import { createWalletJWT } from '../common/create-wallet-jwt';
import { PSBTOptionsWithOnHandlers, PsbtPayload } from './types';

export const generatePSBTMessagePayload = async (options: Omit<PsbtPayload, 'publicKey'>) => {
  const payload: Json = {
    allowedSighash: options.allowedSighash || null,
    hex: options.hex || null,
    signAtIndex: options.signAtIndex || null,
    stxAddress: options.stxAddress || null,
    appDetails: options.appDetails || null,
    publicKey: safeGetPublicKey(options.privateKey),
    network: options.network as any,
  };

  // will sign it or create unsigned JWT
  return createWalletJWT(payload, options.privateKey);
};

export const handlePSBTRequest = async (
  options: PSBTOptionsWithOnHandlers<Omit<PsbtPayload, 'publicKey'>>
) => {
  try {
    const token = await generatePSBTMessagePayload({
      allowedSighash: options.allowedSighash,
      hex: options.hex,
      signAtIndex: options.signAtIndex,
      privateKey: options.privateKey,
      stxAddress: options.stxAddress,
      authOrigin: options.authOrigin,
      appDetails: options.appDetails,
    });
    return openPSBTPopup({
      token,
      onFinish: options.onFinish,
      onCancel: options.onCancel,
    });
  } catch (e: unknown) {
    console.error(`[micro-stacks] handlePSBTRequest failed`);
    console.error(e);
  }
};
