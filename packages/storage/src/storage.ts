import { MicroStacksClient } from '@micro-stacks/client';
import { getFile, putFile } from 'micro-stacks/storage';
import { generateGaiaHubConfigSync } from 'micro-stacks/storage/gaia/config';
import { deleteFromGaiaHub, listFiles } from './utils';

class Storage {
  private client: MicroStacksClient;

  constructor(client: MicroStacksClient) {
    this.client = client;
  }

  private getAccount = () => {
    return this.client.selectAccount(this.client.getState());
  };

  private getGaiaHubConfig = () => {
    const account = this.getAccount();
    if (!account?.appPrivateKey) return;
    return generateGaiaHubConfigSync({
      gaiaHubUrl: 'https://hub.blockstack.org',
      privateKey: account.appPrivateKey,
    });
  };

  putFile = (
    path: string,
    contents: string | Uint8Array | ArrayBufferView | Blob,
    { encrypt = true, sign }: { encrypt?: boolean; sign?: boolean }
  ) => {
    const account = this.getAccount();
    const gaiaHubConfig = this.getGaiaHubConfig();
    if (!account?.appPrivateKey || !gaiaHubConfig) {
      return;
    }
    return putFile(path, contents, {
      privateKey: account.appPrivateKey,
      gaiaHubConfig,
      encrypt,
      sign,
      wasString: typeof contents === 'string',
    });
  };

  getFile = (path: string, { decrypt = true, verify }: { decrypt?: boolean; verify?: boolean }) => {
    const account = this.getAccount();
    const gaiaHubConfig = this.getGaiaHubConfig();
    if (!account?.appPrivateKey || !gaiaHubConfig) {
      return;
    }

    return getFile(path, {
      privateKey: account.appPrivateKey,
      gaiaHubConfig,
      decrypt,
      verify,
    });
  };

  listFiles = ({ prefix, pageToken }: { prefix?: string; pageToken?: string } = {}) => {
    const account = this.getAccount();
    const gaiaHubConfig = this.getGaiaHubConfig();
    if (!account?.appPrivateKey || !gaiaHubConfig) {
      return;
    }
    return listFiles({ gaiaHubConfig, prefix, pageToken, fetcher: this.client.fetcher });
  };

  deleteFile = (path: string) => {
    const account = this.getAccount();
    const gaiaHubConfig = this.getGaiaHubConfig();
    if (!account?.appPrivateKey || !gaiaHubConfig) {
      return;
    }
    return deleteFromGaiaHub(path, gaiaHubConfig);
  };
}

export { Storage };
