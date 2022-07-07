import { bytesToHex } from 'micro-stacks/common';
import { hashSha512_256 } from 'micro-stacks/crypto-sha';
import { ClarityValue, hexToCV } from 'micro-stacks/clarity';

export const leftPadHex = (hexString: string): string =>
  hexString.length % 2 == 0 ? hexString : `0${hexString}`;

export const leftPadHexToLength = (hexString: string, length: number): string =>
  hexString.padStart(length, '0');

export const rightPadHexToLength = (hexString: string, length: number): string =>
  hexString.padEnd(length, '0');

export const txidFromData = (data: Uint8Array): string => {
  const hash = hashSha512_256(data);
  return bytesToHex(hash);
};

/**
 * Read only function response object
 *
 * @param {Boolean} okay - the status of the response
 * @param {string} result - serialized hex clarity value
 */

export interface ReadOnlyFunctionSuccessResponse {
  okay: true;
  result: string;
}

export interface ReadOnlyFunctionErrorResponse {
  okay: false;
  cause: string;
}

export type ReadOnlyFunctionResponse =
  | ReadOnlyFunctionSuccessResponse
  | ReadOnlyFunctionErrorResponse;

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
