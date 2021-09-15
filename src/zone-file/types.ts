export interface SoaType {
  name?: string;
  ttl?: number | string;
  minimum?: number;
  expire?: number;
  retry?: number;
  refresh?: number;
  serial?: number;
  rname?: string;
  mname?: string;
}

export interface NSType {
  name: string;
  ttl?: number;
  host: string;
  fullname?: string;
}

export interface AType {
  name: string;
  ttl?: number;
  ip: string;
}

export interface CNAMEType {
  name: string;
  ttl?: number;
  alias: string;
}

export interface MXType {
  name: string;
  ttl?: number;
  host: string;
  preference: number;
}

export interface TXTType {
  name: string;
  ttl?: number;
  txt: string | string[];
}

export interface SRVType {
  name: string;
  ttl?: number;
  priority: number;
  weight: number;
  port: number;
  target: string;
}

export interface SPFType {
  name: string;
  ttl?: number;
  data: string;
}

export interface URIType {
  name: string;
  ttl?: number;
  priority: number;
  weight: number;
  target: string;
}

export interface ZoneFileObject {
  $origin?: string;
  $ttl?: number;
  soa?: SoaType;
  ns?: NSType[];
  a?: AType[];
  aaaa?: AType[];
  cname?: CNAMEType[];
  mx?: MXType[];
  ptr?: NSType[];
  txt?: TXTType[];
  srv?: SRVType[];
  spf?: SPFType[];
  uri?: URIType[];
  $domain?: string;
}
