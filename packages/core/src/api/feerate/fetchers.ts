import { FeeRate } from '@stacks/stacks-blockchain-api-types';
import { BaseListParams } from '../types';
import { FetchFeeRateParams } from './types';

import { fetchJsonPost, generateUrl, feeRateEndpoint } from '../utils';

/**
 * Fetch fee rate information.
 *
 * @see https://docs.micro-stacks.dev/modules/core/api/fee-rate#fetchfeerate
 */

export async function fetchFeeRate({ url, transaction }: BaseListParams & { transaction: string }) {
  const path = generateUrl(feeRateEndpoint(url), {});
  const body: FetchFeeRateParams = { transaction: transaction };
  return fetchJsonPost<FeeRate>(path, { body });
}
