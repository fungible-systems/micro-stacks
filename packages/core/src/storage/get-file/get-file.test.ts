import { getFile } from 'micro-stacks/storage';
import { setupServer } from 'msw/node';
import { getGlobalScope } from '../common';
import { GET_FILE_DATA, GET_FILE_MOCKS } from '../../../tests/mocks/get-file.mocks';
import _fetch  from 'cross-fetch'

const { FILE_CONTENT, FILE_PATH, gaiaHubConfig } = GET_FILE_DATA;

describe('getFile tests', () => {
  const server = setupServer(...GET_FILE_MOCKS);
  beforeAll(() => {
    server.listen();
  });
  afterEach(() => {
    server.resetHandlers();
    // jest.resetModules();
  });
  afterAll(() => {
    server.close();
  });

  it('should be able to fetch an unencrypted file', async () => {
    const options = { decrypt: false, gaiaHubConfig };
    const file = await getFile(FILE_PATH, options);
    expect(file).toBeTruthy();
    expect(JSON.parse(<string>file)).toEqual(FILE_CONTENT);
  });

  it('should be able to fetch an unencrypted file with name and app passed', async () => {
    const options = {
      username: 'yukan.id',
      app: 'http://localhost:8080',
      decrypt: false,
      gaiaHubConfig,
    };

    await getFile(FILE_PATH, options).then(file => {
      expect(file).toBeTruthy();
      expect(JSON.parse(<string>file)).toEqual(FILE_CONTENT);
    });
  });

  test('should be able to fetch an unencrypted file with custom zoneFileLookupURL', async () => {
    const optionsNameLookupUrl = {
      username: 'yukan.id',
      app: 'http://localhost:8080',
      zoneFileLookupURL: 'https://potato/v1/names',
      decrypt: false,
      gaiaHubConfig,
    };

    await getFile(FILE_PATH, optionsNameLookupUrl).then(file => {
      expect(file).toBeTruthy();
      expect(JSON.parse(<string>file)).toEqual(FILE_CONTENT);
    });
  });

  it('should rely on location.oring for app name', async () => {
    const optionsNoApp = {
      username: 'yukan.id',
      decrypt: false,
      gaiaHubConfig,
    };

    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    delete getGlobalScope()['location'];
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    getGlobalScope().location = new URL('http://localhost:8080');

    await getFile(FILE_PATH, optionsNoApp).then(file => {
      expect(file).toBeTruthy();
      expect(JSON.parse(<string>file)).toEqual(FILE_CONTENT);
    });
  });
});
