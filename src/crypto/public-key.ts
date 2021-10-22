import { CURVE, Point } from 'noble-secp256k1';
import { bytesToBigInt, bytesToHex, intToBytes } from 'micro-stacks/common';

export { getPublicKey } from 'noble-secp256k1';

export const isCompressedPublicKey = (bytes: Uint8Array) => {
  const header = bytes[0];
  return bytes.length === 32 || (bytes.length === 33 && (header === 0x02 || header === 0x03));
};

export const derivePublicKey = (pubKey: Uint8Array, il: Uint8Array) => {
  const publicKeyPoint = Point.fromHex(bytesToHex(pubKey));
  const ecCurvePoint = new Point(CURVE.Gx, CURVE.Gy)
    .multiply(bytesToBigInt(il))
    .add(publicKeyPoint);

  return ecCurvePoint.toRawBytes(isCompressedPublicKey(pubKey));
};

function mod(a: bigint, b: bigint = CURVE.P): bigint {
  const result = a % b;
  return result >= 0 ? result : b + result;
}

export const derivePrivateKey = (privateKey: Uint8Array, il: Uint8Array) =>
  intToBytes(mod(bytesToBigInt(il) + bytesToBigInt(privateKey), CURVE.n), false, 32);
