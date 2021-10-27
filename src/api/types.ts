export interface BaseListParams {
  limit?: number;
  offset?: number;
  url: string;
}

export interface EventListParams {
  event_limit?: number;
  event_offset?: number;
  url: string;
}

export interface FetchFeeRateParams {
  transaction: string;
}

export interface FetchTokensParams {
  address: string;
  stacking?: boolean;
}
