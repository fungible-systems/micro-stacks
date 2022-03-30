import { getPublicKey } from '../public-key';
import { bytesToHex, utf8ToBytes } from 'micro-stacks/common';
import { encryptECIES } from './encrypt-ecies';
import { signECDSA } from './sign';
import type { EncryptContentOptions } from '../common/types';

export async function encryptContent(
  content: string | Uint8Array,
  options: EncryptContentOptions
): Promise<string> {
  let { publicKey, privateKey, wasString } = options;
  const { cipherTextEncoding, sign } = options;

  if (!privateKey && !publicKey)
    throw new Error('Either public key or private key must be supplied for encryption.');

  if (!publicKey && privateKey) publicKey = bytesToHex(getPublicKey(privateKey, true));

  if (typeof wasString !== 'boolean') wasString = typeof content === 'string';

  if (!publicKey) throw new Error('micro-stacks/crypto - no public key found to encrypt content');

  const contentBuffer = typeof content === 'string' ? utf8ToBytes(content) : content;
  const cipherObject = await encryptECIES({
    publicKey,
    content: contentBuffer,
    wasString,
    cipherTextEncoding,
  });
  if (!sign) return JSON.stringify(cipherObject);

  // signing
  if (typeof sign === 'string') privateKey = sign;

  if (!privateKey) throw new Error('micro-stacks/crypto - need private key to sign contents');

  const signatureResponse = await signECDSA({
    contents: JSON.stringify(cipherObject),
    privateKey,
  });

  return JSON.stringify({
    ...signatureResponse,
    cipherText: JSON.stringify(cipherObject),
  });
}
