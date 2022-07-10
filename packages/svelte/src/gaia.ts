import { getClient } from './store';

export const getFile = (
  path: string,
  { decrypt = true, verify }: { decrypt?: boolean; verify?: boolean }
) => {
  const client = getClient();

  return client.getFile(path, { decrypt, verify });
};

export const putFile = (
  path: string,
  contents: string | Uint8Array | ArrayBufferView | Blob,
  { encrypt = true, sign }: { encrypt?: boolean; sign?: boolean }
) => {
  const client = getClient();

  return client.putFile(path, contents, { sign, encrypt });
};
