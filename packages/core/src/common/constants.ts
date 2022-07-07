/**
 * Unsigned 32-bit integer
 */
export enum ChainID {
  Testnet = 0x80000000,
  Mainnet = 0x00000001,
}

export const DEFAULT_CHAIN_ID = ChainID.Mainnet;

export enum TransactionVersion {
  Mainnet = 0x00,
  Testnet = 0x80,
}
