export const DENO_NOBLE_URL = 'https://denopkg.com/paulmillr/noble-secp256k1/mod.ts';

export const packages = [
  'clarity',
  'common',
  'connect',
  'crypto',
  'crypto-aes',
  'network',
  'react',
  'storage',
  'transactions',
  'zone-file',
];
const LIBRARY = 'micro-stacks';

export function makePackageDenoUrls(packages, ext = 'js') {
  const record = {};
  packages.forEach(pkg => {
    record[`${LIBRARY}/${pkg}`] = () => `https://deno.land/x/microstacks/${pkg}.${ext}`;
  });
  return record;
}
