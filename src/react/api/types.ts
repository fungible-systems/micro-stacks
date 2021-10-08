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

// TODO: this is a duplicate of WithHeight in react/api/accounts/types, should they be merged?
export type WithHeight<T> = T & { height?: number };
