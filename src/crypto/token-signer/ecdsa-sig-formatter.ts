// Derived from https://github.com/Brightspace/node-ecdsa-sig-formatter

import { base64ToBytes, bytesToBase64, copy } from 'micro-stacks/common';

const MAX_OCTET = 0x80;
const CLASS_UNIVERSAL = 0;
const PRIMITIVE_BIT = 0x20;
const TAG_SEQ = 0x10;
const TAG_INT = 0x02;
const ENCODED_TAG_SEQ = TAG_SEQ | PRIMITIVE_BIT | (CLASS_UNIVERSAL << 6);
const ENCODED_TAG_INT = TAG_INT | (CLASS_UNIVERSAL << 6);

function getSignature(sig: string | Uint8Array) {
  return typeof sig === 'string' ? base64ToBytes(sig) : sig;
}

export function derToJoseES256(sig: string | Uint8Array) {
  const signature = getSignature(sig);
  const paramBytes = 32; // (256 / 8)

  // the DER encoded param should at most be the param size, plus a padding
  // zero, since due to being a signed integer
  const maxEncodedParamLength = paramBytes + 1;

  const inputLength = signature.length;

  let offset = 0;
  if (signature[offset++] !== ENCODED_TAG_SEQ) {
    throw new Error('Could not find expected "seq"');
  }

  let seqLength = signature[offset++];
  if (seqLength === (MAX_OCTET | 1)) {
    seqLength = signature[offset++];
  }

  if (inputLength - offset < seqLength) {
    throw new Error(
      '"seq" specified length of "' +
        seqLength +
        '", only "' +
        (inputLength - offset) +
        '" remaining'
    );
  }

  if (signature[offset++] !== ENCODED_TAG_INT) {
    throw new Error('Could not find expected "int" for "r"');
  }

  const rLength = signature[offset++];

  if (inputLength - offset - 2 < rLength) {
    throw new Error(
      '"r" specified length of "' +
        rLength +
        '", only "' +
        (inputLength - offset - 2) +
        '" available'
    );
  }

  if (maxEncodedParamLength < rLength) {
    throw new Error(
      '"r" specified length of "' +
        rLength +
        '", max of "' +
        maxEncodedParamLength +
        '" is acceptable'
    );
  }

  const rOffset = offset;
  offset += rLength;

  if (signature[offset++] !== ENCODED_TAG_INT) {
    throw new Error('Could not find expected "int" for "s"');
  }

  const sLength = signature[offset++];

  if (inputLength - offset !== sLength) {
    throw new Error(
      '"s" specified length of "' + sLength + '", expected "' + (inputLength - offset) + '"'
    );
  }

  if (maxEncodedParamLength < sLength) {
    throw new Error(
      '"s" specified length of "' +
        sLength +
        '", max of "' +
        maxEncodedParamLength +
        '" is acceptable'
    );
  }

  const sOffset = offset;
  offset += sLength;

  if (offset !== inputLength) {
    throw new Error(
      'Expected to consume entire buffer, but "' + (inputLength - offset) + '" bytes remain'
    );
  }

  const rPadding = paramBytes - rLength;
  const sPadding = paramBytes - sLength;

  const dst = new Uint8Array(rPadding + rLength + sPadding + sLength);

  for (offset = 0; offset < rPadding; ++offset) {
    dst[offset] = 0;
  }
  dst.set(signature.slice(rOffset + Math.max(-rPadding, 0), rOffset + rLength), offset);

  offset = paramBytes;

  for (let o = offset; offset < o + sPadding; ++offset) {
    dst[offset] = 0;
  }
  dst.set(signature.slice(sOffset + Math.max(-sPadding, 0), sOffset + sLength), offset);

  return bytesToBase64(dst).replace(/=/g, '');
}

function countPadding(buf: Uint8Array, start: number, stop: number) {
  let padding = 0;
  while (start + padding < stop && buf[start + padding] === 0) {
    ++padding;
  }

  const needsSign = buf[start + padding] >= MAX_OCTET;
  if (needsSign) {
    --padding;
  }

  return padding;
}

export function joseToDerES256(sig: string | Uint8Array) {
  const signature = getSignature(sig);
  const paramBytes = 32; // (256 / 8)

  const rPadding = countPadding(signature, 0, paramBytes);
  const sPadding = countPadding(signature, paramBytes, signature.length);
  const rLength = paramBytes - rPadding;
  const sLength = paramBytes - sPadding;

  const rsBytes = 1 + 1 + rLength + 1 + 1 + sLength;

  const shortLength = rsBytes < MAX_OCTET;

  const dst = new Uint8Array((shortLength ? 2 : 3) + rsBytes);

  let offset = 0;
  dst[offset++] = ENCODED_TAG_SEQ;
  if (shortLength) {
    // Bit 8 has value "0"
    // bits 7-1 give the length.
    dst[offset++] = rsBytes;
  } else {
    // Bit 8 of first octet has value "1"
    // bits 7-1 give the number of additional length octets.
    dst[offset++] = MAX_OCTET | 1;
    // length, base 256
    dst[offset++] = rsBytes & 0xff;
  }
  dst[offset++] = ENCODED_TAG_INT;
  dst[offset++] = rLength;
  if (rPadding < 0) {
    dst[offset++] = 0;
    offset += copy(signature, dst, offset, 0, paramBytes);
  } else {
    offset += copy(signature, dst, offset, rPadding, paramBytes);
  }
  dst[offset++] = ENCODED_TAG_INT;
  dst[offset++] = sLength;

  if (sPadding < 0) {
    dst[offset++] = 0;
    copy(signature, dst, offset, paramBytes);
  } else {
    copy(signature, dst, offset, paramBytes + sPadding);
  }

  return bytesToBase64(dst).replace(/=/g, '');
}
