import { ClarityValue, createAddress, hexToCV } from 'micro-stacks/clarity';
import { ReadOnlyFunctionResponse } from './types';
import { StacksNetworkVersion } from 'micro-stacks/crypto';

/**
 * Converts the response of a read-only function call into its Clarity Value
 * @param response - {@link ReadOnlyFunctionResponse}
 */
export function parseReadOnlyResponse<T extends ClarityValue>(
  response: ReadOnlyFunctionResponse
): T {
  if (response.okay) {
    return hexToCV(response.result);
  } else {
    throw new Error(response.cause);
  }
}

export function isMainnetAddress(contractAddress: string) {
  const { version } = createAddress(contractAddress);
  return (
    version === StacksNetworkVersion.mainnetP2SH || version === StacksNetworkVersion.mainnetP2PKH
  );
}
