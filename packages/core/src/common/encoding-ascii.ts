export function asciiToBytes(str: string) {
  const byteArray = [];
  for (let i = 0; i < str.length; ++i) {
    // Node's code seems to be doing this and not & 0x7F..
    byteArray.push(str.charCodeAt(i) & 0xff);
  }
  return new Uint8Array(byteArray);
}

export function bytesToAscii(buffer: Uint8Array) {
  let ret = '';
  const end = buffer.length;

  for (let i = 0; i < end; ++i) {
    ret += String.fromCharCode(buffer[i] & 0x7f);
  }
  return ret;
}
