export function utf8ToBytes(content: string) {
  return new TextEncoder().encode(content);
}

export function bytesToUtf8(buffer: Uint8Array) {
  return new TextDecoder().decode(buffer);
}
