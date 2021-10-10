import { CoreNodeFeeResponse } from '@stacks/stacks-blockchain-api-types';
import { BaseListParams } from '../types';
import { fetchJson, generateUrl, feesEndpoint } from '../utils';

/**
 * Get an estimated fee rate for STX transfer transactions. This a a fee rate / byte, and is returned as a JSON integer
 *
 * @see https://blockstack.github.io/stacks-blockchain-api/#operation/get_fee_transfer
 */

export async function feesSearch({ url }: BaseListParams) {
  const path = generateUrl(feesEndpoint(url), {});
  return fetchJson<CoreNodeFeeResponse>(path);
}
