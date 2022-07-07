export function isSubtleCryptoAvailable(): boolean {
  return typeof crypto !== 'undefined' && typeof crypto.subtle !== 'undefined';
}

export function isNodeCryptoAvailable<T>(
  withFeature: (nodeCrypto: typeof import('crypto')) => boolean | T
): false | T;
export function isNodeCryptoAvailable<T>(
  withFeature?: (nodeCrypto: typeof import('crypto')) => boolean | T
): boolean | T {
  try {
    const resolvedResult = require.resolve('crypto');
    if (!resolvedResult) {
      return false;
    }
    const cryptoModule = require('crypto') as typeof import('crypto');
    if (!cryptoModule) return false;
    if (withFeature) return withFeature(cryptoModule);
    return true;
  } catch (error) {
    return false;
  }
}

export const NO_CRYPTO_LIB =
  'Crypto lib not found. Either the WebCrypto "crypto.subtle" or Node.js "crypto" module must be available.';

export interface WebCryptoLib {
  lib: Crypto; // Note this is the typedef for the Web Crypto API, included with typescript
  name: 'webCrypto';
}

export interface NodeCryptoLib {
  lib: typeof import('crypto');
  name: 'nodeCrypto';
}

// Make async for future version which may lazy load.
// eslint-disable-next-line @typescript-eslint/require-await
export async function getCryptoLib(): Promise<WebCryptoLib | NodeCryptoLib> {
  if (isSubtleCryptoAvailable()) {
    return {
      lib: crypto,
      name: 'webCrypto',
    };
  } else {
    try {
      const nodeCrypto = require('crypto') as typeof import('crypto');
      return {
        lib: nodeCrypto,
        name: 'nodeCrypto',
      };
    } catch (error) {
      throw new Error(NO_CRYPTO_LIB);
    }
  }
}
