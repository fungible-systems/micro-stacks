import { FinishedTxData } from '../popup';

export interface StacksProvider {
  /**
   * Make a transaction request
   *
   * @param payload - a JSON web token representing a transaction request
   */
  transactionRequest(payload: string): Promise<FinishedTxData>;

  /**
   * Request to update the wallet profile
   *
   * NOTE: this is not implemented in the wallet yet
   *
   * @param payload - a JSON web token representing a transaction request
   */
  profileUpdateRequest(payload: string): Promise<string>;

  /**
   * Make an authentication request
   *
   * @param payload - a JSON web token representing an auth request
   *
   * @returns an authResponse string in the form of a JSON web token
   */
  authenticationRequest(payload: string): Promise<string>;

  getProductInfo:
    | undefined
    | (() => {
        version: string;
        name: string;
        meta?: {
          tag?: string;
          commit?: string;
          [key: string]: any;
        };
        [key: string]: any;
      });
}
