import { RunFaucetResponse } from '@stacks/stacks-blockchain-api-types';
import { BaseListParams } from '../types';
import { FetchStxTokensParams } from './types';
import { fetchJsonPost, generateUrl, stxFaucetEndpoint, btcFaucetEndpoint } from '../utils';

/**
 * Get STX tokens
 *
 * @see https://blockstack.github.io/stacks-blockchain-api/#operation/run_faucet_stx
 */

export async function fetchGetStxTokens({
  url,
  address,
  stacking = false,
}: BaseListParams & FetchStxTokensParams) {
  const path = generateUrl(stxFaucetEndpoint(url), {});
  const body: FetchStxTokensParams = { address: address, stacking: stacking };
  return fetchJsonPost<RunFaucetResponse>(path, { body });
}

/**
 * Get BTC tokens
 *
 * @see https://blockstack.github.io/stacks-blockchain-api/#operation/run_faucet_btc
 */

export async function fetchGetBtcTokens({ url, address }: BaseListParams & { address: string }) {
  const path = generateUrl(btcFaucetEndpoint(url), {});
  const body: FetchStxTokensParams = { address: address };
  return fetchJsonPost<RunFaucetResponse>(path, { body });
}
