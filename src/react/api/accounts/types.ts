export interface AccountBase {
  url: string;
  principal: string;
}

export interface ListEndpointBase {
  limit?: number;
  offset?: number;
}

export type AccountListOptions = AccountBase & ListEndpointBase;
export type WithHeight<T> = T & { height?: number };
export type PrincipalListWithNetwork = [principal: string, limit: number, networkUrl: string];
export type PrincipalListHeightWithNetwork = [
  principal: string,
  params: { limit: number; height?: number },
  networkUrl: string
];
export type PrincipalWithNetwork = [principal: string, networkUrl: string];
