import { makeAuthResponse, makeDIDFromAddress } from './index';
import { decodeToken, getPublicKey, publicKeyToStxAddress } from 'micro-stacks/crypto';
import {
  doPublicKeysMatchIssuer,
  doSignaturesMatchPublicKeys,
  isExpirationDateValid,
  isIssuanceDateValid,
} from './verification';

const privateKey = 'a5c61c6ca7b3e7e55edee68566aeab22e4da26baa285c7bd10e8d2218aa3b229';
const publicKey = '027d28f9951ce46538951e3697c62588a87f1f1f295de4a14fdd4c780fc52cfe69';
const nameLookupURL = 'https://stacks-node-api.mainnet.stacks.co/v1/names/';
const profile = {
  '@type': 'Person',
  account: [
    {
      service: 'bitcoin',
      '@type': 'Account',
      identifier: '1LFS37yRSibwbf8CnXeCn5t1GKeTEZMmu9',
      role: 'payment',
    },
    {
      service: 'pgp',
      contentUrl: 'https://s3.amazonaws.com/pk9/ryan',
      '@type': 'Account',
      identifier: '1E4329E6634C75730D4D88C0638F2769D55B9837',
    },
    {
      service: 'openbazaar',
      proofType: 'http',
      '@type': 'Account',
      proofUrl: 'https://www.facebook.com/msrobot0/posts/10153644446452759',
      identifier: 'f2250123a6af138c86b30f3233b338961dc8fbc3',
    },
    {
      service: 'twitter',
      proofType: 'http',
      '@type': 'Account',
      proofUrl: 'https://twitter.com/ryaneshea/status/765575388735082496',
      identifier: 'ryaneshea',
    },
    {
      service: 'github',
      proofType: 'http',
      '@type': 'Account',
      proofUrl: 'https://gist.github.com/shea256/a6dc1f3182f28bb2285feaef07a14340',
      identifier: 'shea256',
    },
    {
      service: 'facebook',
      proofType: 'http',
      '@type': 'Account',
      proofUrl: 'https://www.facebook.com/ryaneshea/posts/10154182997407713',
      identifier: 'ryaneshea',
    },
  ],
  website: [
    {
      '@type': 'WebSite',
      url: 'http://shea.io',
    },
  ],
  description: 'Co-founder of Blockstack Inc.',
  name: 'Ryan Shea',
  address: {
    '@type': 'PostalAddress',
    addressLocality: 'New York',
  },
  image: [
    {
      '@type': 'ImageObject',
      contentUrl: 'https://s3.amazonaws.com/kd4/ryan',
      name: 'avatar',
    },
    {
      '@type': 'ImageObject',
      contentUrl: 'https://s3.amazonaws.com/dx3/ryan',
      name: 'cover',
    },
  ],
};

test('makeAuthResponse && verifyAuthResponse', async () => {
  const authResponse = await makeAuthResponse({
    privateKey,
    profile,
  });

  expect(authResponse).toBeTruthy();

  const decodedToken = decodeToken(authResponse);
  expect(decodedToken).toBeTruthy();

  const address = publicKeyToStxAddress(getPublicKey(privateKey));
  const referenceDID = makeDIDFromAddress(address);
  expect((decodedToken?.payload as any).iss).toEqual(referenceDID);

  expect(JSON.stringify((decodedToken?.payload as any).profile)).toEqual(JSON.stringify(profile));
  expect((decodedToken?.payload as any).username).toBe(null);
  expect(isExpirationDateValid(authResponse)).toBe(true);
  expect(isIssuanceDateValid(authResponse)).toBe(true);
  expect(doSignaturesMatchPublicKeys(authResponse)).toBe(true);
  expect(doPublicKeysMatchIssuer(authResponse)).toBe(true);
});
