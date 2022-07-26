export function uuidv4() {
  // @ts-ignore
  return ([1e7] + -1e3 + -4e3 + -8e3 + -1e11).replace(/[018]/g, c =>
    (c ^ (crypto.getRandomValues(new Uint8Array(1))[0] & (15 >> (c / 4)))).toString(16)
  );
}

const extractType = (key: string) => key.split(':')[0];
export const extractId = (key: string) => key.split(':')[1];
export const extractField = (key: string) => key.split(':')[2];

export function noop() {}
