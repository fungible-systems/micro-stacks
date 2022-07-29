import { getRandomBytes } from 'micro-stacks/crypto';

export function uuidv4() {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID !== 'undefined')
    return crypto.randomUUID();
  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  // @ts-ignore
  return ([1e7] + -1e3 + -4e3 + -8e3 + -1e11).replace(/[018]/g, (c: number) =>
    (c ^ (getRandomBytes(1)[0] & (15 >> (c / 4)))).toString(16)
  );
}

export const extractType = (key: string) => key.split(':')[0];
export const extractId = (key: string) => key.split(':')[1];
export const extractField = (key: string) => key.split(':')[2];
export const extractCreatedAtFromField = (key: string) => key.split(':')[3];

export function noop() {}
