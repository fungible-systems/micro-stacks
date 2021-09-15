export function isCompressed(bytes: Uint8Array) {
  return bytes.length === 32 || (bytes.length === 33 && (bytes[0] === 0x02 || bytes[0] === 0x03));
}
