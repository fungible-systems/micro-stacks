import { hashSha512 } from 'micro-stacks/crypto-sha';

export function sharedSecretToKeys(sharedSecret: Uint8Array): {
  encryptionKey: Uint8Array;
  hmacKey: Uint8Array;
} {
  // generate mac and encryption key from shared secret
  const hashedSecret = hashSha512(sharedSecret);
  return {
    encryptionKey: hashedSecret.slice(0, 32),
    hmacKey: hashedSecret.slice(32),
  };
}
