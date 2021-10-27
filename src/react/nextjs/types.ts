export type SessionCookie = [
  mainnet: string,
  testnet: string,
  identityAddress: string,
  profile_url: string,
  hubUrl: string
];

export interface PartialStacksSession {
  addresses: {
    mainnet: string;
    testnet: string;
  };
  identityAddress: string;
  profile_url: string;
  hubUrl: string;
}
