import {
  encryptECIES,
  getPublicKey,
  publicKeyToStxAddress,
  TokenSigner,
} from 'micro-stacks/crypto';
import { bytesToHex, hexToBytes, utf8ToBytes } from 'micro-stacks/common';

export function makeDIDFromAddress(address: string) {
  return `did:btc-addr:${address}`;
}

export function nextMonth() {
  return new Date(new Date().setMonth(new Date().getMonth() + 1));
}

export function makeUUID4() {
  let d = new Date().getTime();
  if (typeof performance !== 'undefined' && typeof performance.now === 'function') {
    d += performance.now(); // use high-precision timer if available
  }
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, c => {
    const r = (d + Math.random() * 16) % 16 | 0;
    d = Math.floor(d / 16);
    return (c === 'x' ? r : (r & 0x3) | 0x8).toString(16);
  });
}

interface MakeAuthResponseParams {
  privateKey: string;
  profile?: any;
  username?: string;
  metadata?: any;
  coreToken?: string;
  appPrivateKey?: string;
  expiresAt?: number;
  transitPublicKey?: string;
  hubUrl?: string;
  blockstackAPIUrl?: string;
  associationToken?: string;
}

export async function encryptPrivateKey(publicKey: string, privateKey: string): Promise<string> {
  const encryptedObj = await encryptECIES({
    content: hexToBytes(privateKey),
    publicKey,
    cipherTextEncoding: 'hex',
    wasString: false,
  });
  const encryptedJSON = JSON.stringify(encryptedObj);
  return bytesToHex(utf8ToBytes(encryptedJSON));
}

export async function makeAuthResponse(params: MakeAuthResponseParams): Promise<string> {
  let { expiresAt } = params;
  const {
    privateKey,
    appPrivateKey,
    coreToken,
    transitPublicKey,
    metadata,
    hubUrl,
    blockstackAPIUrl,
    associationToken,
    username,
    profile,
  } = params;
  /* Convert the private key to a public key to an issuer */
  const publicKey = bytesToHex(getPublicKey(privateKey));
  const address = publicKeyToStxAddress(publicKey);

  if (!expiresAt) expiresAt = nextMonth().getTime() as number;

  /* See if we should encrypt with the transit key */
  let privateKeyPayload = appPrivateKey;
  let coreTokenPayload = coreToken;
  let additionalProperties = {};
  if (appPrivateKey !== undefined && appPrivateKey !== null) {
    if (transitPublicKey !== undefined && transitPublicKey !== null) {
      privateKeyPayload = await encryptPrivateKey(transitPublicKey, appPrivateKey);
      if (coreToken !== undefined && coreToken !== null) {
        coreTokenPayload = await encryptPrivateKey(transitPublicKey, coreToken);
      }
    }
    additionalProperties = {
      email: metadata?.email ? metadata.email : null,
      profile_url: metadata?.profileUrl ? metadata.profileUrl : null,
      hubUrl,
      blockstackAPIUrl,
      associationToken,
      version: 'undefined',
    };
  }

  /* Create the payload */
  const payload = {
    jti: makeUUID4(),
    iat: Math.floor(new Date().getTime() / 1000), // JWT times are in seconds
    exp: Math.floor(expiresAt / 1000), // JWT times are in seconds
    iss: makeDIDFromAddress(address),
    private_key: privateKeyPayload ?? null,
    public_keys: [publicKey],
    profile: profile ?? null,
    username: username ?? null,
    core_token: coreTokenPayload ?? null,
    ...additionalProperties,
  };

  /* Sign and return the token */
  const tokenSigner = new TokenSigner('ES256k', privateKey);
  return tokenSigner.sign(payload);
}
