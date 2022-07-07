export type Json = string | number | boolean | null | Json[] | { [key: string]: Json };

export interface JSONObject {
  [key: string]: Json;
}

export interface TokenInterface {
  header: {
    [key: string]: string | Json;
    alg?: any;
    typ?: any;
  };
  payload:
    | {
        [key: string]: Json;
        iss?: any | string;
        jti?: any | string;
        iat?: any | string | number;
        exp?: any | string | number;
      }
    | string;
  signature: string;
}

export interface TokenInterfaceEncodedObject {
  header: string[];
  payload: string;
  signature: string;
}

export interface SignedToken {
  header: string[];
  payload: string;
  signature: string[];
}
