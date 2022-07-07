export const DATA_DERIVATION_PATH = `m/888'/0'`;
/**
 * BIP44 derivation paths
 * > m / purpose' / coin_type' / account' / change / address_index
 * @see https://github.com/bitcoin/bips/blob/master/bip-0044.mediawiki
 */
// This should be `m/44'/5757'/0'/1` (note hardened 44 vs not), but it sadly was not set to be.
// it's generally okay, but non-standard. This is only used for the wallet-config.json file
export const WALLET_CONFIG_PATH = `m/44/5757'/0'/1`;

// For the stx main key, we technically should be adjusting the "account'" index
// however, we never did that and as such we are incrementing the `address_index`
// to generate new "accounts"
export const STX_DERIVATION_PATH = `m/44'/5757'/0'/0`;

export const WALLET_CONFIG_GAIA_PATH = 'wallet-config.json';
export const DEFAULT_GAIA_HUB_URL = 'https://hub.blockstack.org';
