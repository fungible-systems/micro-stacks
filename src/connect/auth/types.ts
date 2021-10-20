import type { GaiaHubConfig } from 'micro-stacks/storage';
import { Json } from 'micro-stacks/crypto';

// this is what comes from the extension
export interface AuthResponsePayload {
  private_key: string;
  username: string | null;
  hubUrl: string;
  associationToken: string;
  blockstackAPIUrl: string | null; // TODO: stacks? or do we even need this
  core_token: string | null;
  email: string | null;
  exp: number;
  iat: number;
  iss: string;
  jti: string;
  version: string;
  profile: Profile;
  profile_url: string;
  public_keys: string[];
}

// minimum version to authenticate with extension
export interface AuthRequestPayload {
  scopes: AuthScope[];
  redirect_uri: string;
  public_keys: string[];
  domain_name: string;
  appDetails: AppDetails;
}

export interface Profile {
  '@context'?: 'http://schema.org';
  '@type'?: 'Person';
  account?: {
    '@type': 'Account';
    identifier: string;
    placeholder: boolean;
    proofType: 'http';
    proofUrl: string;
    service: string;
  }[];
  api?: {
    gaiaHubConfig?: Partial<GaiaHubConfig>; // not sure why this is partial, might be legacy
    gaiaHubUrl?: string;
  };
  apps?: Record<string, string>;
  appsMeta?: Record<
    string,
    {
      storage: string;
      publicKey: string;
    }
  >;
  description?: string;
  image?: {
    '@type': 'ImageObject';
    contentUrl: string;
    name: 'avatar';
  }[];
  name?: string;
  stxAddress: {
    testnet: string;
    mainnet: string;
  };
}

export interface StacksSessionState {
  addresses: {
    testnet: string;
    mainnet: string;
  };
  appPrivateKey: string;
  associationToken: string;
  hubUrl: string;
  public_keys?: string[];
  profile: Profile;
  profile_url: string;
  username: string | null;
  version?: string;
  decentralizedID: string;
  identityAddress?: string;
}

/**
 * Non-exhaustive list of common permission scopes.
 */
export type AuthScope =
  /**
   * Read and write data to the user's Gaia hub in an app-specific storage bucket.
   * This is the default scope.
   */
  | 'store_write'
  /**
   * Publish data so that other users of the app can discover and interact with the user.
   * The user's files stored on Gaia hub are made visible to others via the `apps` property in the
   * user’s `profile.json` file.
   */
  | 'publish_data';

interface AppDetails {
  /** A human-readable name for your application */
  name: string;
  /** A full URL that resolves to an image icon for your application */
  icon: string;
}

// minimum version
export interface AuthOptions {
  /** The URL you want the user to be redirected to after authentication. */
  redirectTo?: string;
  manifestPath?: string;
  /**
   * This callback is fired after authentication is finished.
   * `UserData`: the data for the newly authenticated user
   * */
  onFinish?: (payload: StacksSessionState) => void;
  /** This callback is fired if the user exits before finishing */
  onCancel?: (error?: Error) => void;
  /** If `sendToSignIn` is `true`, then the user will be sent through the sign in flow. */
  sendToSignIn?: boolean;
  scopes?: AuthScope[];
  appDetails: AppDetails;
}
