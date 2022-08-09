import { deleteFile } from './delete-file';
// import fetchMock from 'jest-fetch-mock';
import { GaiaHubConfig } from 'micro-stacks/storage';
import * as m from './delete-from-gaia-hub';
import { mockDelete, mockFetch } from 'vi-fetch';
import { fail } from 'assert';

const path = 'file.json';
const gaiaHubConfig: GaiaHubConfig = {
  address: '1NZNxhoxobqwsNvTb16pdeiqvFvce3Yabc',
  server: 'https://hub.testblockstack.org',
  url_prefix: 'https://gaia.testblockstack.org/hub/',
  token: '',
  max_file_upload_size_megabytes: 25,
};

describe(`${deleteFile.name}`, function () {
  beforeEach(() => {
    mockFetch.clearAll();
    vi.clearAllMocks();
  });

  test('deleteFile throw on 404', async () => {
    const path = 'missingfile.txt';
    const fullDeleteUrl =
      'https://hub.testblockstack.org/delete/1NZNxhoxobqwsNvTb16pdeiqvFvce3Yabc/missingfile.txt';

    const mock = mockDelete(/.*/).willFail('', 404);

    const error = vi.fn();

    await deleteFile(path, { wasSigned: false, gaiaHubConfig })
      .then(() => fail('deleteFile with 404 should fail'))
      .catch(error);

    expect(error).toHaveBeenCalledTimes(1);
    expect(mock.spy.calls[0][1]!.method).toEqual('DELETE');
    expect(mock.spy.calls[0][0]).toEqual(fullDeleteUrl);
  });

  test('deleteFile wasSigned deletes signature file', async () => {
    const fullDeleteUrl =
      'https://hub.testblockstack.org/delete/1NZNxhoxobqwsNvTb16pdeiqvFvce3Yabc/file.json';
    const fullDeleteSigUrl =
      'https://hub.testblockstack.org/delete/1NZNxhoxobqwsNvTb16pdeiqvFvce3Yabc/file.json.sig';

    const mock = mockDelete(/.*/).willResolve('', 202);

    await deleteFile(path, { wasSigned: true, gaiaHubConfig });
    expect(mock.spy.calls.length).toEqual(2);
    expect(mock.spy.calls[0][1]!.method).toEqual('DELETE');
    expect(mock.spy.calls[0][0]).toEqual(fullDeleteUrl);
    expect(mock.spy.calls[1][1]!.method).toEqual('DELETE');
    expect(mock.spy.calls[1][0]).toEqual(fullDeleteSigUrl);
  });

  test('deletes a file', async () => {
    const success = vi.fn();
    const options = { wasSigned: false, gaiaHubConfig };
    const deleteFromGaiaHub = vi.fn();

    vi.spyOn(m, 'deleteFromGaiaHub').mockImplementation(deleteFromGaiaHub);
    await deleteFile(path, options).then(success);

    expect(success).toHaveBeenCalled();
    expect(m.deleteFromGaiaHub).toHaveBeenCalledTimes(1);
  });
});
